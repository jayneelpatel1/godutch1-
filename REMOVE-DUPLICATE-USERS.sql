-- ============================================
-- Remove Duplicate Users (Keep Latest by created_at)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: Check duplicates
SELECT 
  'DUPLICATE CHECK' as info,
  email,
  COUNT(*) as count,
  ARRAY_AGG(id) as user_ids,
  ARRAY_AGG(created_at ORDER BY created_at DESC) as created_dates
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 2: Delete older duplicates (keep the latest created_at for each email)
DELETE FROM users a
USING (
  SELECT id, email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM users
) b
WHERE a.id = b.id AND b.rn > 1;

-- Step 3: Verify no more duplicates
SELECT 
  'AFTER CLEANUP' as info,
  email,
  COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Expected: No rows returned (no duplicates)

SELECT 'DUPLICATE USERS REMOVED! Each email now has one record.' as status;
