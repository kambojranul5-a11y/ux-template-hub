# Analytics Dashboard Documentation

## Overview
The Analytics Dashboard is a comprehensive admin-only page that displays real-time and historical data related to website activity, user engagement, and template downloads.

## Features Implemented

### 1. **Summary Cards Section**
Four key metric cards at the top of the dashboard:

- **Total Downloads** - Shows total template downloads with percentage increase
- **Active Users** - Displays current active sessions (updates every 5 seconds)
- **Page Views** - Total page views for the selected date range
- **Bounce Rate** - Website bounce rate with trend indicator

### 2. **Interactive Charts**

#### Downloads Over Time (Line Chart)
- Displays daily download trends over the selected time period
- Uses Recharts LineChart component
- Shows downloads on Y-axis and dates on X-axis
- Responsive and interactive with hover tooltips

#### Traffic Sources (Bar Chart)
- Visualizes where visitors come from:
  - Direct traffic
  - Organic Search
  - Social Media
  - Referral links
- Color-coded bars for easy identification
- Shows visitor count for each source

#### Device Breakdown (Pie Chart)
- Shows distribution of visitors by device type:
  - Desktop
  - Mobile
  - Tablet
- Displays percentages directly on chart
- Includes detailed breakdown below the chart with icons

#### Top Templates (Bar Chart)
- Lists most downloaded templates
- Shows actual download counts from Supabase database
- Horizontal progress bars normalized to the highest count
- Real-time updates when new downloads occur

### 3. **Recent Activity Table**
- Displays last 10 template downloads
- Columns: Template name, Date & Time, Status
- Real-time updates via Supabase subscription
- Responsive design (some columns hidden on mobile)

### 4. **Date Range Filter**
Located in the header with options:
- Last 7 days
- Last 14 days
- Last 30 days (default)
- Last 60 days
- Last 90 days

Changes the time-series data displayed in charts.

## Technical Implementation

### Technologies Used
- **React** - Component framework
- **TypeScript** - Type safety
- **Recharts** - Chart library for data visualization
- **date-fns** - Date manipulation and formatting
- **Supabase** - Backend database and real-time subscriptions
- **shadcn/ui** - UI components (Card, Select, Button)
- **Tailwind CSS** - Styling

### Data Flow

#### Real Data (from Supabase)
- Total downloads count
- Downloads by template
- Recent download records
- Real-time updates via PostgreSQL change subscriptions

#### Mock Data (for demonstration)
- Time-series data (downloads, visitors, page views over time)
- Traffic source breakdown
- Device type distribution
- Active user count (simulated real-time with 5-second intervals)

### Key Functions

```typescript
// Generate time-series data based on date range
generateTimeSeriesData(days: number)

// Fetch download stats from Supabase
fetchDownloadStats()

// Real-time subscription for new downloads
supabase.channel('analytics-updates')
  .on('postgres_changes', {...})
  .subscribe()
```

## Access Control
- **Admin Only** - Page redirects to `/auth` if user is not an admin
- Uses `useAuth` hook to check `isAdmin` status
- Queries `user_roles` table in Supabase

## File Location
```
src/pages/Analytics.tsx
```

## Routes
- Path: `/analytics`
- Defined in: `src/App.tsx`

## Mock Data Sources

### Traffic Sources
```typescript
const trafficSourceData = [
  { name: 'Direct', value: 342, color: '#0088FE' },
  { name: 'Organic Search', value: 567, color: '#00C49F' },
  { name: 'Social Media', value: 189, color: '#FFBB28' },
  { name: 'Referral', value: 234, color: '#FF8042' },
];
```

### Device Data
```typescript
const deviceData = [
  { name: 'Desktop', value: 658, color: '#8884d8' },
  { name: 'Mobile', value: 512, color: '#82ca9d' },
  { name: 'Tablet', value: 162, color: '#ffc658' },
];
```

## Responsive Design
- Mobile-first approach
- Grid layouts adjust from 1 column (mobile) to 2-4 columns (desktop)
- Charts are fully responsive using ResponsiveContainer
- Table columns hide on small screens
- Navigation menu collapses on mobile

## Real-time Features

### 1. Download Tracking
- Listens to INSERT events on `template_downloads` table
- Automatically refreshes stats when new downloads occur
- No page reload required

### 2. Active Users Simulation
- Updates every 5 seconds
- Random fluctuation between 5 and 30+ users
- Demonstrates real-time capability

## Customization Options

### To Add Real Traffic Data
Replace mock data with actual analytics from:
- Google Analytics API
- Custom tracking events
- Server logs
- Supabase analytics

### To Add More Metrics
1. Add new summary card in the grid
2. Create data fetching function
3. Update state management
4. Add appropriate icon from lucide-react

### To Add New Chart Types
Recharts supports:
- Area charts
- Radar charts
- Scatter plots
- Composed charts
- Treemaps

Example:
```typescript
import { AreaChart, Area } from 'recharts';

<AreaChart data={data}>
  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
</AreaChart>
```

## Performance Considerations

### Optimizations
- Data fetched only once on mount
- Real-time subscriptions instead of polling
- Memoization of expensive calculations
- Cleanup of subscriptions on unmount
- Lazy loading of chart components

### Potential Improvements
- Add pagination to Recent Activity table
- Implement data caching with React Query
- Add export functionality (CSV, PDF)
- Add comparison mode (compare two date ranges)
- Add drill-down capability (click chart to see details)

## Testing Checklist

✅ Dashboard loads without errors  
✅ All charts render correctly  
✅ Date range filter updates charts  
✅ Real downloads appear in real-time  
✅ Active users counter updates  
✅ Mobile responsive layout works  
✅ Admin-only access enforced  
✅ Navigation menu functions  
✅ No console errors  

## Future Enhancements

### Short-term
- Add data export functionality
- Implement comparison date ranges
- Add user location map (if geo data available)
- Add filtering by template category

### Long-term
- Integrate with Google Analytics
- Add custom dashboard builder (drag-and-drop widgets)
- Implement A/B test result visualization
- Add predictive analytics (trend forecasting)
- User journey visualization
- Funnel analysis

## Dependencies
All dependencies are already installed in package.json:
- recharts: ^2.15.4
- date-fns: ^3.6.0
- lucide-react: ^0.462.0
- @supabase/supabase-js: ^2.75.1

## Environment Setup
Ensure these environment variables are set:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Running the Dashboard

### Development
```bash
npm run dev
```
Access at: http://localhost:8080/analytics (or http://localhost:8081 if 8080 is in use)

### Production Build
```bash
npm run build
npm run preview
```

## Support
For issues or questions about the Analytics Dashboard, refer to:
- Recharts documentation: https://recharts.org
- Supabase docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com

---

**Created:** October 20, 2025  
**Version:** 1.0  
**Author:** GitHub Copilot
