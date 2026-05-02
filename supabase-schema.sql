-- Go Dutch Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trip', 'roommates', 'couple', 'office', 'other')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  note TEXT,
  category TEXT NOT NULL CHECK (category IN ('food', 'rent', 'petrol', 'travel', 'shopping', 'utilities', 'entertainment', 'other')),
  split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'exact', 'percentage', 'ratio')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense splits table
CREATE TABLE IF NOT EXISTS expense_splits (
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owed_amount DECIMAL(12, 2) NOT NULL,
  percentage DECIMAL(5, 2),
  ratio DECIMAL(5, 2),
  PRIMARY KEY (expense_id, user_id)
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('expense_added', 'expense_edited', 'settlement', 'member_joined', 'member_left')),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users: everyone can read, only owner can update
CREATE POLICY "Users can be read by anyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups: members can read their groups, owners can create/update/delete
CREATE POLICY "Group members can read their groups" ON groups FOR SELECT 
  USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group owners can update groups" ON groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Group owners can delete groups" ON groups FOR DELETE USING (auth.uid() = created_by);

-- Group members: members can read, anyone in group can add/remove
CREATE POLICY "Group members can be read by members" ON group_members FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Group members can insert" ON group_members FOR INSERT WITH CHECK 
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Group members can delete" ON group_members FOR DELETE USING 
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Expenses: group members can CRUD
CREATE POLICY "Expenses can be read by group members" ON expenses FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Expenses can be inserted by group members" ON expenses FOR INSERT WITH CHECK
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Expenses can be updated by group members" ON expenses FOR UPDATE USING
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Expenses can be deleted by group members" ON expenses FOR DELETE USING
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Expense splits: same as expenses
CREATE POLICY "Expense splits can be read" ON expense_splits FOR SELECT USING (true);
CREATE POLICY "Expense splits can be inserted" ON expense_splits FOR INSERT WITH CHECK (true);
CREATE POLICY "Expense splits can be updated" ON expense_splits FOR UPDATE USING (true);
CREATE POLICY "Expense splits can be deleted" ON expense_splits FOR DELETE USING (true);

-- Settlements: group members can CRUD
CREATE POLICY "Settlements can be read by group members" ON settlements FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Settlements can be inserted by group members" ON settlements FOR INSERT WITH CHECK
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Settlements can be updated by group members" ON settlements FOR UPDATE USING
  (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Activities: group members can read
CREATE POLICY "Activities can be read by group members" ON activities FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Activities can be inserted" ON activities FOR INSERT WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_expenses_group ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_settlements_group ON settlements(group_id);
CREATE INDEX idx_activities_group ON activities(group_id);

-- Function to auto-add user to auth.users trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();