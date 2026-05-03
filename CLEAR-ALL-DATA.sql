-- ============================================
-- CLEAR ALL DATA (Start Fresh)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Delete in correct order (respecting foreign keys)
DELETE FROM activities;
DELETE FROM settlements;
DELETE FROM expense_splits;
DELETE FROM expenses;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM users;

-- Verify empty tables
SELECT 'activities' as table_name, COUNT(*) as count FROM activities
UNION ALL
SELECT 'settlements', COUNT(*) FROM settlements
UNION ALL
SELECT 'expense_splits', COUNT(*) FROM expense_splits
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Expected: All counts = 0

SELECT 'ALL DATA CLEARED! Ready for fresh start.' as status;
