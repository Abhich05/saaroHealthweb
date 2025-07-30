# Granular Loading System

This document explains the new granular loading system that replaces full-page loading with component-specific loading states.

## Overview

Instead of showing a full-page loading screen, each component now handles its own loading state. This provides a better user experience by:

1. **Faster perceived performance** - Users see content as it loads
2. **Better UX** - No blank screens while waiting
3. **Component isolation** - One slow component doesn't block others
4. **Professional appearance** - Loading states match component boundaries

## Available Loading Components

### 1. Full Page Loading (`Loading`)
- Used only for initial app loading
- Shows complete page skeleton with animations
- Import: `import Loading from '../components/ui/Loading'`

### 2. Table Loading (`TableLoader`)
- Shows skeleton rows within table boundaries
- Props:
  - `rows`: Number of skeleton rows (default: 5)
  - `columns`: Number of columns (default: 4)
  - `className`: Additional CSS classes
- Import: `import { TableLoader } from '../components/ui/Loading'`

### 3. KPI Loading (`KPILoader`)
- Shows skeleton KPI cards
- Props:
  - `count`: Number of KPI cards (default: 3)
  - `className`: Additional CSS classes
- Import: `import { KPILoader } from '../components/ui/Loading'`

### 4. Graph Loading (`GraphLoader`)
- Shows skeleton for charts/graphs
- Props:
  - `className`: Additional CSS classes
- Import: `import { GraphLoader } from '../components/ui/Loading'`

### 5. Card Loading (`CardLoader`)
- Shows skeleton for general cards
- Props:
  - `className`: Additional CSS classes
- Import: `import { CardLoader } from '../components/ui/Loading'`

### 6. Spinner (`Spinner`)
- Simple spinning loader
- Props:
  - `size`: 'sm', 'md', 'lg', 'xl' (default: 'md')
  - `className`: Additional CSS classes
- Import: `import { Spinner } from '../components/ui/Loading'`

### 7. Skeleton Text (`SkeletonText`)
- Shows skeleton text lines
- Props:
  - `lines`: Number of lines (default: 1)
  - `className`: Additional CSS classes
- Import: `import { SkeletonText } from '../components/ui/Loading'`

## Updated Components

### GenericTable
Now supports loading prop:
```jsx
<GenericTable 
  columns={columns} 
  data={data} 
  loading={loading}
  loadingRows={5}
/>
```

### KPISection
Now supports loading prop:
```jsx
<KPISection 
  kpis={kpis} 
  loading={loading}
  loadingCount={3}
/>
```

### Chart Components (BarGraph, LineGraph)
Now support loading prop:
```jsx
<BarGraph data={data} loading={loading} />
<LineGraph data={data} loading={loading} />
```

## Implementation Pattern

### 1. Replace Full-Page Loading
**Before:**
```jsx
if (loading) return <Loading />;
```

**After:**
```jsx
// Remove full-page loading
// Add granular loading states to components
```

### 2. Add Granular Loading States
```jsx
const [kpisLoading, setKpisLoading] = useState(true);
const [tableLoading, setTableLoading] = useState(true);
const [graphLoading, setGraphLoading] = useState(true);
```

### 3. Update Data Fetching
```jsx
// Load KPIs
const loadKPIs = async () => {
  setKpisLoading(true);
  try {
    const res = await axiosInstance.get('/api/kpis');
    setKpis(res.data);
  } catch (error) {
    console.error('Error loading KPIs:', error);
  } finally {
    setKpisLoading(false);
  }
};

// Load table data
const loadTableData = async () => {
  setTableLoading(true);
  try {
    const res = await axiosInstance.get('/api/table-data');
    setTableData(res.data);
  } catch (error) {
    console.error('Error loading table data:', error);
  } finally {
    setTableLoading(false);
  }
};
```

### 4. Pass Loading Props to Components
```jsx
<KPISection kpis={kpis} loading={kpisLoading} />
<GenericTable data={tableData} loading={tableLoading} />
<BarGraph data={graphData} loading={graphLoading} />
```

## Example: Dashboard Page

The Dashboard page demonstrates the complete implementation:

1. **Multiple loading states** for different sections
2. **Independent data fetching** for each component
3. **Component-specific loading** instead of full-page loading
4. **Error handling** for each section independently

## Benefits

1. **Better Performance Perception**: Users see content loading progressively
2. **Improved UX**: No blank screens or jarring transitions
3. **Component Isolation**: Slow components don't block others
4. **Professional Appearance**: Loading states match component boundaries
5. **Maintainability**: Each component handles its own loading state

## Migration Guide

To migrate existing pages:

1. Remove `if (loading) return <Loading />;`
2. Add granular loading state variables
3. Split data fetching into separate functions
4. Pass loading props to components
5. Update components to use new loading props

## Best Practices

1. **Use appropriate loading components** for each UI element
2. **Set reasonable loading times** - don't show loading for fast operations
3. **Handle errors gracefully** for each section
4. **Keep loading states consistent** across the application
5. **Test loading states** with slow network conditions 