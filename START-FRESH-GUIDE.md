# 🔄 Start Fresh Guide

## Problem Identified
Your `users` table has **duplicate emails** with different Firebase UIDs:
- `jayneel9472@gmail.com` → 3 different UIDs
- `chetna9472@gmail.com` → 1 UID

This causes:
- "Duplicate key" errors
- Groups not showing (wrong UID used)
- Confusion about which user is which

---

## ✅ Step 1: Clear Supabase Database

**Run this in Supabase Dashboard > SQL Editor:**

```sql
-- File: CLEAR-ALL-DATA.sql (already created)
DELETE FROM activities;
DELETE FROM settlements;
DELETE FROM expense_splits;
DELETE FROM expenses;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM users;
```

**Verify empty tables:**
```sql
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
```

**Expected:** All counts = 0

---

## ✅ Step 2: (Optional) Clear Firebase Users

If you want to reuse the same email addresses:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Authentication > Users**
3. Delete: `jayneel9472@gmail.com`, `chetna9472@gmail.com`
4. This lets you sign up again with the same email

**Skip this if you want to use different emails for testing.**

---

## ✅ Step 3: Ensure Email Constraint is Removed

The `users` table had a unique constraint on `email`. We need to remove it permanently:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Verify it's gone
SELECT tc.constraint_name, tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' AND kcu.column_name = 'email';

-- Expected: No rows returned (constraint removed)
```

---

## ✅ Step 4: Clear Browser/App Cache

### Web:
- Press `Ctrl + Shift + Delete`
- Clear **Cache** and **Cookies** for localhost
- Or open Incognito/Private window

### Mobile:
- Uninstall the app
- Reinstall fresh

---

## ✅ Step 5: Sign Up Fresh

1. Open the app
2. **Sign up** with your email (or new test emails)
3. Firebase creates a new user
4. App calls `createOrUpdateUser` → inserts into `users` table (no duplicates!)
5. Create groups, add members → **should work perfectly now!**

---

## 🧪 Testing Checklist

After signing up:

- [ ] Check browser console: `console.log(user?.id)` → shows Firebase UID
- [ ] Run in Supabase: `SELECT * FROM users;` → **only 1 row per email**
- [ ] Create a group → works without errors
- [ ] Add member by email → they receive the invite
- [ ] Member logs in → sees the group immediately

---

## 📁 Files Created for You

1. **`CLEAR-ALL-DATA.sql`** → Run first to delete all data
2. **`REMOVE-DUPLICATE-USERS.sql`** → Alternative: keep latest, delete older duplicates
3. **`START-FRESH-GUIDE.md`** → This guide

---

## 🚀 Quick Start (Minimum Steps)

1. Run `CLEAR-ALL-DATA.sql` in Supabase
2. Clear browser cache
3. Sign up again
4. **Done!** ✅

---

## ⚠️ Note: Online-Only Mode

We've switched to **online-only mode** (no SQLite/local storage). This means:
- ✅ Simpler codebase
- ✅ No sync conflicts
- ⚠️ Requires internet connection
- 🔜 Offline sync will be added in later phase (M6)

---

**Ready to go! Run the SQL, clear cache, and sign up fresh! 🎉**
