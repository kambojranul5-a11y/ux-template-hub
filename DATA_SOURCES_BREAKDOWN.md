# Analytics Dashboard - Data Sources Breakdown

## 📊 Data Status: Mixed (Real + Mock)

Yes, some data is hardcoded/mock data, but the important metrics are **REAL** from your Supabase database!

---

## ✅ REAL DATA (From Supabase Database)

These metrics are fetched live from your Supabase `template_downloads` table:

### 1. **Total Downloads**
- **Source:** Supabase query counting all rows in `template_downloads` table
- **Real-time:** Yes - updates automatically when new downloads happen
- **Code:**
```typescript
const totalDownloads = data?.length || 0;
```

### 2. **Downloads by Template (Top Templates Chart)**
- **Source:** Supabase data grouped by `template_id`
- **Real-time:** Yes - subscribes to INSERT events
- **Shows:** Actual download counts per template
- **Code:**
```typescript
const downloadCounts: Record<string, number> = {};
data?.forEach((download) => {
  downloadCounts[download.template_id] = (downloadCounts[download.template_id] || 0) + 1;
});
```

### 3. **Recent Activity Table**
- **Source:** Last 10 records from `template_downloads` table
- **Real-time:** Yes - updates when new downloads occur
- **Shows:** Template name, date/time of download, status
- **Code:**
```typescript
recentDownloads: data?.slice(0, 10).map(d => ({
  templateId: d.template_id,
  downloadedAt: d.downloaded_at
}))
```

### 4. **Real-time Subscriptions**
- Listens to PostgreSQL changes on `template_downloads` table
- Automatically refreshes when new INSERT events occur
- No polling needed!

---

## 🎭 MOCK/HARDCODED DATA (For Demonstration)

These are simulated for UI demonstration purposes:

### 1. **Active Users Counter**
- **Status:** Mock/Simulated
- **Behavior:** Random number between 5-30+, updates every 5 seconds
- **Why Mock:** Requires session tracking/analytics integration
- **Code:**
```typescript
const [activeUsers, setActiveUsers] = useState(23);

useEffect(() => {
  const interval = setInterval(() => {
    setActiveUsers(prev => Math.max(5, prev + Math.floor(Math.random() * 7) - 3));
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

### 2. **Downloads Over Time (Line Chart)**
- **Status:** ✅ **REAL DATA**
- **Source:** Supabase `template_downloads` table
- **Function:** `generateTimeSeriesFromDownloads(downloads, days)`
- **Behavior:** Groups actual downloads by date within selected range
- **Real-time:** Yes - updates when new downloads occur
- **Code:**
```typescript
const generateTimeSeriesFromDownloads = (downloads: { downloadedAt: string }[], days: number) => {
  const data = [];
  const downloadsByDate: Record<string, number> = {};
  
  // Count downloads per day
  downloads.forEach((download) => {
    const date = format(new Date(download.downloadedAt), 'MMM dd');
    downloadsByDate[date] = (downloadsByDate[date] || 0) + 1;
  });
  
  // Create data for each day in the range
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, 'MMM dd');
    data.push({
      date: dateKey,
      downloads: downloadsByDate[dateKey] || 0,
    });
  }
  
  return data;
};
```

### 3. **Traffic Sources (Bar Chart)**
- **Status:** Hardcoded
- **Data:** Direct (342), Organic (567), Social (189), Referral (234)
- **Why Mock:** Requires Google Analytics or similar integration
- **Code:**
```typescript
const trafficSourceData = [
  { name: 'Direct', value: 342, color: '#0088FE' },
  { name: 'Organic Search', value: 567, color: '#00C49F' },
  { name: 'Social Media', value: 189, color: '#FFBB28' },
  { name: 'Referral', value: 234, color: '#FF8042' },
];
```

### 4. **Device Breakdown (Pie Chart)**
- **Status:** Hardcoded
- **Data:** Desktop (658), Mobile (512), Tablet (162)
- **Why Mock:** Requires user agent tracking
- **Code:**
```typescript
const deviceData = [
  { name: 'Desktop', value: 658, color: '#8884d8' },
  { name: 'Mobile', value: 512, color: '#82ca9d' },
  { name: 'Tablet', value: 162, color: '#ffc658' },
];
```

### 5. **Page Views**
- **Status:** Calculated from mock time-series data
- **Behavior:** Sum of pageViews from generated data
- **Why Mock:** Requires page view tracking
- **Code:**
```typescript
const totalPageViews = timeSeriesData.reduce((sum, item) => sum + item.pageViews, 0);
```

### 6. **Bounce Rate**
- **Status:** Hardcoded
- **Value:** 22.04%
- **Why Mock:** Requires session analytics
- **Code:**
```typescript
const bounceRate = 22.04; // Mock bounce rate
```

---

## 📈 Summary Table

| Metric | Status | Source | Real-time |
|--------|--------|--------|-----------|
| **Total Downloads** | ✅ REAL | Supabase | Yes |
| **Downloads by Template** | ✅ REAL | Supabase | Yes |
| **Recent Activity Table** | ✅ REAL | Supabase | Yes |
| **Downloads Over Time Chart** | ✅ REAL | Supabase | Yes |
| Active Users | 🎭 Mock | Simulated | Fake |
| Traffic Sources | 🎭 Mock | Hardcoded | No |
| Device Breakdown | 🎭 Mock | Hardcoded | No |
| Page Views | 🎭 Mock | Estimated | No |
| Bounce Rate | 🎭 Mock | Hardcoded | No |

---

## 🔧 How to Make Everything Real

### Option 1: Add Analytics Tracking Tables
Create new Supabase tables to track:

```sql
-- Track page views
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Track sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  pages_viewed INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT false
);

-- Track traffic sources
CREATE TABLE traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL, -- 'direct', 'organic', 'social', 'referral'
  referrer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Option 2: Integrate Google Analytics
Use Google Analytics API to fetch real data:

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient();

async function fetchRealAnalytics() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }, { name: 'source' }],
    metrics: [{ name: 'activeUsers' }, { name: 'bounceRate' }],
  });
  return response;
}
```

### Option 3: Custom Tracking with Supabase
Add tracking to your template download function:

```typescript
// Track page view
await supabase.from('page_views').insert({
  page_url: window.location.href,
  user_agent: navigator.userAgent,
  referrer: document.referrer,
  device_type: getDeviceType(), // helper function
});

// Track session
await supabase.from('sessions').insert({
  session_id: sessionStorage.getItem('session_id'),
  pages_viewed: 1,
});
```

---

## 🎯 Quick Answer

**Yes, majority of the data is hardcoded/mock** for demonstration purposes.

**What's Real:**
- ✅ Total downloads count
- ✅ Downloads per template
- ✅ Recent download records
- ✅ **Downloads over time chart (NEW!)**
- ✅ Real-time updates when downloads happen

**What's Mock:**
- 🎭 Active users counter
- 🎭 Traffic sources
- 🎭 Device breakdown
- 🎭 Page views (estimated from downloads)
- 🎭 Bounce rate

**Why?** The mock data provides a complete UI demonstration without requiring complex analytics infrastructure. You can replace it with real tracking whenever you're ready!

---

**Created:** October 20, 2025  
**Current Real Data:** Downloads from Supabase  
**Mock Data Purpose:** UI demonstration and design validation
