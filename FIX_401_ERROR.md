# 🔴 FIX: 401 Unauthorized Error - Download Tracking

## Problem
**Error:** `Failed to load resource: the server responded with a status of 401 ()`  
**Cause:** Supabase Row Level Security (RLS) policies are blocking anonymous INSERT operations

## ✅ SOLUTION (Choose One)

---

### **Option 1: Fix RLS Policies (Recommended)**

#### Step 1: Go to Supabase SQL Editor
1. Open: https://supabase.com/dashboard/project/htuacbjcsqyzxqnspteo/sql/new
2. Paste the SQL below
3. Click **Run**

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Anyone can track downloads" ON public.template_downloads;
DROP POLICY IF EXISTS "Anyone can view download stats" ON public.template_downloads;

-- Create new permissive policies
CREATE POLICY "Enable insert for anon and authenticated users"
ON public.template_downloads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for anon and authenticated users"
ON public.template_downloads
FOR SELECT
TO anon, authenticated
USING (true);

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT ON public.template_downloads TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

#### Step 2: Verify
Run this query to check policies:
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'template_downloads';
```

You should see:
- `Enable insert for anon and authenticated users` - INSERT - {anon,authenticated}
- `Enable select for anon and authenticated users` - SELECT - {anon,authenticated}

#### Step 3: Test
Go back to your app and click Download. Should work now! ✅

---

### **Option 2: Disable RLS Temporarily (Quick Test)**

⚠️ **Warning:** This disables security. Use only for testing!

```sql
-- Disable RLS for template_downloads table
ALTER TABLE public.template_downloads DISABLE ROW LEVEL SECURITY;
```

Test downloads in your app. If it works, the issue is RLS policies.

**Then re-enable and fix policies:**
```sql
-- Re-enable RLS
ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;

-- Then run the policies from Option 1
```

---

### **Option 3: Grant Permissions to Service Role**

If the above doesn't work, also grant to service_role:

```sql
GRANT ALL ON public.template_downloads TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
```

---

## 🧪 Test Insert Manually

Run this in Supabase SQL Editor to test:

```sql
-- Test insert
INSERT INTO public.template_downloads (template_id) 
VALUES ('test-manual-insert');

-- Check if it worked
SELECT * FROM public.template_downloads 
ORDER BY downloaded_at DESC 
LIMIT 5;
```

---

## 🔍 Debug: Check Current Policies

Run this to see what policies exist:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'template_downloads';
```

---

## 📝 Expected Result

After fixing, you should see in browser console:
- ✅ `📊 Tracking download for template ID: 1`
- ✅ `✅ Download tracked successfully: [...]`
- ✅ Download count increases on page

---

## 🎯 Root Cause Analysis

**Why 401 Error?**

The anon role (used by your public app) doesn't have INSERT permission on `template_downloads` table due to RLS policies.

**What's RLS?**
Row Level Security - PostgreSQL feature that restricts which users can read/write specific rows.

**Why did it happen?**
The initial migration might have created policies that only work for authenticated users, but your app allows public (anonymous) downloads.

**The Fix:**
Create policies that explicitly allow both `anon` and `authenticated` roles to INSERT and SELECT.

---

## 🔄 Full Reset (If Nothing Works)

Completely recreate the table:

```sql
-- Drop table
DROP TABLE IF EXISTS public.template_downloads CASCADE;

-- Recreate table
CREATE TABLE public.template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert downloads"
ON public.template_downloads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read downloads"
ON public.template_downloads
FOR SELECT
TO anon, authenticated
USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON public.template_downloads TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create indexes
CREATE INDEX idx_template_downloads_template_id ON public.template_downloads(template_id);
CREATE INDEX idx_template_downloads_downloaded_at ON public.template_downloads(downloaded_at);
```

---

## ✅ After Applying Fix

1. Refresh your app: http://localhost:8081
2. Open Console (F12)
3. Click Download on any template
4. Should see: `✅ Download tracked successfully`
5. Count should increase immediately!

---

## 📞 Still Not Working?

**Check these:**

1. **API Key Valid?**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `anon public` key
   - Compare with your `.env` file
   - If different, update `.env` and restart server

2. **Project Active?**
   - Check if Supabase project is paused
   - Go to: https://supabase.com/dashboard/project/htuacbjcsqyzxqnspteo

3. **Network Issues?**
   - Check Network tab in DevTools
   - Look for the POST request to `/rest/v1/template_downloads`
   - Check the response body for error details

---

**Priority: Run Option 1 SQL in Supabase SQL Editor now!** 🚀

After running, refresh your app and try downloading again. The error should be gone!
