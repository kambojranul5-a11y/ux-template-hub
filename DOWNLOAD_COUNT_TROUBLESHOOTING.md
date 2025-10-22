# Download Count Issue - Troubleshooting Guide

## Issue
Download count is not increasing on Analytics page or Templates page after clicking download.

## Possible Causes & Solutions

### 1. **Supabase Realtime Not Enabled**

**Check:** Go to your Supabase Dashboard
- Navigate to: https://supabase.com/dashboard/project/htuacbjcsqyzxqnspteo
- Go to **Database** → **Replication**
- Ensure `template_downloads` table has **Realtime enabled**

**Fix in Dashboard:**
1. Go to **Database** → **Replication**
2. Find `template_downloads` in the table list
3. Toggle ON the switch for Realtime
4. Click Save

**Fix via SQL:**
```sql
-- Enable realtime for template_downloads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.template_downloads;
```

---

### 2. **Database Insert Failing Silently**

**Test the Insert:**
Open browser console (F12) and check for errors when you click download.

**Manual Test via Supabase:**
1. Go to Supabase Dashboard → **Table Editor**
2. Select `template_downloads` table
3. Click **Insert** → **Insert row**
4. Add:
   - `template_id`: `1` (or any template ID)
   - Let `id` and `downloaded_at` auto-generate
5. Click Save
6. Check if count updates on Templates/Analytics page

---

### 3. **RLS Policies Not Applied**

**Check Policies:**
Go to **Database** → **Policies** → Select `template_downloads` table

Should see:
- ✅ "Anyone can track downloads" (INSERT with CHECK: true)
- ✅ "Anyone can view download stats" (SELECT with USING: true)

**Fix via SQL:**
```sql
-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can track downloads" ON public.template_downloads;
DROP POLICY IF EXISTS "Anyone can view download stats" ON public.template_downloads;

-- Recreate policies
CREATE POLICY "Anyone can track downloads" 
ON public.template_downloads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view download stats" 
ON public.template_downloads 
FOR SELECT 
USING (true);
```

---

### 4. **Realtime Subscription Not Working**

**Add Console Logs:**
Add this temporarily to see what's happening:

In `src/pages/Templates.tsx`, line ~82:
```typescript
const channel = supabase
  .channel('template-downloads')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'template_downloads'
    },
    (payload) => {
      console.log('🎉 New download detected!', payload); // ADD THIS
      fetchDownloadCounts();
    }
  )
  .subscribe((status) => {
    console.log('📡 Subscription status:', status); // ADD THIS
  });
```

**Expected Console Output:**
- On page load: `📡 Subscription status: SUBSCRIBED`
- On download: `🎉 New download detected! { ... }`

---

### 5. **Template ID Mismatch**

**Check Template IDs:**
Your templates use IDs: "1", "2", "3", "4"

Make sure database inserts use the **same format** (string, not number).

In `TemplateCard.tsx`, the insert is:
```typescript
.insert({ template_id: template.id });
```

This should be fine, but verify in Supabase Table Editor that `template_id` column contains `"1"`, `"2"`, etc. (not `1`, `2` as integers).

---

### 6. **Quick Test Download**

**Test without UI:**
Run this in browser console on any page:

```javascript
// Test insert
const { data, error } = await supabase
  .from('template_downloads')
  .insert({ template_id: '1' });

if (error) {
  console.error('❌ Insert failed:', error);
} else {
  console.log('✅ Insert successful!', data);
}

// Test select
const { data: downloads, error: selectError } = await supabase
  .from('template_downloads')
  .select('*');

if (selectError) {
  console.error('❌ Select failed:', selectError);
} else {
  console.log('✅ Downloads:', downloads);
}
```

---

### 7. **Environment Variables**

**Check .env file has correct values:**
```
VITE_SUPABASE_URL=https://htuacbjcsqyzxqnspteo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**After changing .env, restart dev server:**
```bash
npm run dev
```

---

### 8. **Browser Cache**

**Clear cache and hard reload:**
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R

Or clear browser data:
- Chrome: Settings → Privacy → Clear browsing data
- Select "Cached images and files"

---

## Debugging Steps (In Order)

### Step 1: Check Browser Console
1. Open page: http://localhost:8081/
2. Press F12 to open DevTools
3. Go to Console tab
4. Click Download button on any template
5. Look for:
   - ✅ "Success" toast message
   - ❌ Any red error messages
   - Look for text: "Failed to track download"

### Step 2: Check Supabase Table
1. Go to Supabase Dashboard
2. Navigate to **Table Editor** → `template_downloads`
3. Click Download button on your site
4. Refresh the table in Supabase
5. New row should appear immediately

### Step 3: Check Realtime Status
1. Open Console
2. Look for: `📡 Subscription status: SUBSCRIBED`
3. If you see `CLOSED` or `CHANNEL_ERROR`, realtime is not working

### Step 4: Manual Insert Test
1. Supabase Dashboard → **SQL Editor**
2. Run:
```sql
INSERT INTO public.template_downloads (template_id)
VALUES ('1');
```
3. Check if count increases on your site (might need to refresh)

---

## Most Likely Issue: Realtime Not Enabled

**Quick Fix:**
1. Go to https://supabase.com/dashboard/project/htuacbjcsqyzxqnspteo/database/replication
2. Find `template_downloads` in the list
3. Toggle **Realtime** ON
4. Save changes
5. Refresh your website
6. Try downloading again

---

## Need More Help?

**Check these logs:**
1. Browser Console (F12) → Console tab
2. Browser Console → Network tab (look for Supabase requests)
3. Supabase Dashboard → **Logs** → **Database Logs**
4. Supabase Dashboard → **Logs** → **Realtime Logs**

**Share with me:**
- Any error messages from Console
- Screenshot of `template_downloads` table in Supabase
- Realtime replication status

---

**Last Updated:** October 20, 2025  
**Status:** Debugging in progress  
**Most Likely Cause:** Realtime replication not enabled for `template_downloads` table
