# Real Analytics Implementation Guide

## ✅ Completed Steps

1. **Created Database Migration**: `supabase/migrations/20251020000000_add_analytics_tracking.sql`
   - `page_views` table for tracking every page visit
   - `sessions` table for tracking user sessions
   - `get_active_users()` function to count active sessions (last 5 minutes)
   - `get_bounce_rate()` function to calculate bounce percentage
   - RLS policies for public access

2. **Created Tracking Utilities**: `src/lib/analytics.ts`
   - `trackPageView()` - Records page visits
   - `updateSessionActivity()` - Keeps sessions alive
   - `endSession()` - Marks when user leaves
   - `getSessionId()` - Manages session IDs

3. **Created Analytics Hook**: `src/hooks/useAnalytics.tsx`
   - Tracks page views on route changes
   - Updates session activity every 30 seconds
   - Handles beforeunload and visibility change events

4. **Integrated Hook**: `src/App.tsx`
   - Added `AppContent` component that calls `useAnalytics()`
   - All routes now automatically tracked

5. **Updated Analytics Dashboard**: `src/pages/Analytics.tsx`
   - Fetches real active users from `get_active_users()`
   - Fetches real page views count from `page_views` table
   - Fetches real bounce rate from `get_bounce_rate()`
   - Refreshes active users every 30 seconds

## 🚨 IMPORTANT: Next Steps Required

### Step 1: Run SQL Migration in Supabase

**You MUST run the migration to create the required tables and functions.**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/htuacbjcsqyzxqnspteo

2. Navigate to: **SQL Editor** → **New Query**

3. Copy and paste the entire contents of:
   ```
   supabase/migrations/20251020000000_add_analytics_tracking.sql
   ```

4. Click **Run** to execute the migration

5. Verify the tables were created:
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('page_views', 'sessions');
   ```

### Step 2: Regenerate Supabase Types

After running the migration, regenerate TypeScript types:

```powershell
# Make sure you have Supabase CLI installed
# If not: npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref htuacbjcsqyzxqnspteo

# Generate types
npx supabase gen types typescript --project-id htuacbjcsqyzxqnspteo > src/integrations/supabase/types.ts
```

### Step 3: Remove @ts-nocheck from analytics.ts

Once types are regenerated, edit `src/lib/analytics.ts`:

```typescript
// Remove this line:
// @ts-nocheck - Tables not yet in generated types

// Keep the rest of the code as is
```

### Step 4: Test the Implementation

1. **Start your dev server** (if not already running):
   ```powershell
   npm run dev
   ```

2. **Test page view tracking**:
   - Open http://localhost:8081
   - Navigate between pages (Templates → Analytics → About)
   - Check browser console for: `📊 Page view tracked: /analytics`

3. **Verify data in Supabase**:
   ```sql
   -- Check page views
   SELECT * FROM page_views ORDER BY viewed_at DESC LIMIT 10;
   
   -- Check sessions
   SELECT * FROM sessions ORDER BY started_at DESC LIMIT 10;
   
   -- Test active users function
   SELECT get_active_users();
   
   -- Test bounce rate function
   SELECT get_bounce_rate();
   ```

4. **Verify Analytics Dashboard**:
   - Go to http://localhost:8081/analytics
   - Check that all 4 metrics show real data:
     - ✅ Total Downloads (already working)
     - ✅ Active Users (now real data)
     - ✅ Page Views (now real data)
     - ✅ Bounce Rate (now real data)

## 📊 How the Real-Time Tracking Works

### Page View Tracking Flow
1. User visits any page → `useAnalytics()` hook fires
2. `trackPageView()` is called with current URL
3. Record inserted into `page_views` table
4. Session updated in `sessions` table

### Session Management
- **Session ID**: Stored in `sessionStorage` (unique per browser tab)
- **Activity Updates**: Every 30 seconds via `updateSessionActivity()`
- **Session End**: When user closes tab or leaves site
- **Active User Definition**: Session active in last 5 minutes

### Bounce Rate Calculation
- **Bounce**: Session with only 1 page view
- **Formula**: `(bounce sessions / total sessions) * 100`
- **Updates**: Real-time as sessions are created

### Active Users Count
- **Definition**: Sessions with `last_activity_at` in last 5 minutes
- **Updates**: Refreshed every 30 seconds on Analytics page
- **Includes**: All browser tabs currently viewing your site

## 🐛 Troubleshooting

### TypeScript Errors After Implementation

**Problem**: TypeScript complains about `page_views` and `sessions` tables not existing

**Solution**: You haven't run Step 2 (Regenerate Supabase Types). Run:
```powershell
npx supabase gen types typescript --project-id htuacbjcsqyzxqnspteo > src/integrations/supabase/types.ts
```

### Analytics Metrics Show 0

**Problem**: Active Users, Page Views, or Bounce Rate showing 0

**Possible Causes**:
1. SQL migration not run in Supabase (most common)
2. RLS policies blocking access
3. Functions not created

**Solution**:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('page_views', 'sessions');

-- Check if functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('get_active_users', 'get_bounce_rate');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('page_views', 'sessions');
```

### Page Views Not Being Tracked

**Problem**: No data appearing in `page_views` table

**Check**:
1. Open browser console (F12)
2. Look for: `📊 Page view tracked: [url]`
3. If you don't see this, check if `useAnalytics` hook is running
4. Check for errors in console

**Manual Test**:
```typescript
// In browser console
supabase.from('page_views').select('*').then(console.log)
```

### Bounce Rate Shows 0% or 100%

**Problem**: Unrealistic bounce rate

**Causes**:
- Not enough session data yet (need at least a few sessions)
- All sessions are single-page (everyone leaves immediately)
- Bug in calculation

**Solution**: Let the site run for a while to collect data

## 📈 Data Schema Reference

### page_views Table
```sql
- id: UUID (primary key)
- session_id: UUID (links to sessions table)
- page_url: TEXT (e.g., "/analytics")
- referrer: TEXT (where user came from)
- user_agent: TEXT (browser info)
- viewed_at: TIMESTAMP (when page was viewed)
```

### sessions Table
```sql
- id: UUID (primary key)
- session_id: UUID (unique session identifier)
- first_page: TEXT (landing page)
- started_at: TIMESTAMP (session start time)
- last_activity_at: TIMESTAMP (last interaction)
- page_count: INTEGER (pages viewed in session)
- is_bounce: BOOLEAN (true if only 1 page viewed)
- ended_at: TIMESTAMP (when session ended)
```

## 🎯 Summary

All analytics metrics now use **real data**:
- ✅ **Total Downloads**: Real data from `template_downloads`
- ✅ **Active Users**: Real-time count from `get_active_users()`
- ✅ **Page Views**: Real count from `page_views` table
- ✅ **Bounce Rate**: Real calculation from `get_bounce_rate()`
- ✅ **Downloads Over Time**: Real time-series from `template_downloads`

The only mock data remaining is:
- Traffic Sources (Direct, Organic, Social, Referral)
- Device Breakdown (Desktop, Mobile, Tablet)

These can be tracked by parsing `user_agent` field in `page_views` table if needed in the future.
