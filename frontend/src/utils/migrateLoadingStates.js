/**
 * Migration Helper for Loading States
 * 
 * This file contains utility functions and patterns to help migrate
 * existing pages from full-page loading to granular loading states.
 */

// List of pages that need migration
export const PAGES_TO_MIGRATE = [
  'UserManagementPage',
  'Template', 
  'PatientQueue',
  'PatientHistoryPage',
  'Messages',
  'IpdRecords',
  'Invoice',
  'DropDownConfiguration',
  'Document',
  'Discharge',
  'CreateRx',
  'ConsultDummy'
];

// Migration pattern for each page type
export const MIGRATION_PATTERNS = {
  // Pattern for pages with tables
  tablePage: {
    remove: 'if (loading) return <Loading />;',
    addStates: [
      'const [tableLoading, setTableLoading] = useState(true);',
      'const [dataLoading, setDataLoading] = useState(true);'
    ],
    updateTable: '<GenericTable columns={columns} data={data} loading={tableLoading} loadingRows={10} />',
    updateFetching: `
      const loadTableData = async () => {
        setTableLoading(true);
        try {
          const res = await axiosInstance.get('/api/data');
          setData(res.data);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setTableLoading(false);
        }
      };
    `
  },
  
  // Pattern for pages with KPIs
  kpiPage: {
    remove: 'if (loading) return <Loading />;',
    addStates: [
      'const [kpisLoading, setKpisLoading] = useState(true);'
    ],
    updateKPI: '<KPISection kpis={kpis} loading={kpisLoading} loadingCount={3} />',
    updateFetching: `
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
    `
  },
  
  // Pattern for pages with graphs
  graphPage: {
    remove: 'if (loading) return <Loading />;',
    addStates: [
      'const [graphLoading, setGraphLoading] = useState(true);'
    ],
    updateGraph: '<BarGraph data={data} loading={graphLoading} />',
    updateFetching: `
      const loadGraphData = async () => {
        setGraphLoading(true);
        try {
          const res = await axiosInstance.get('/api/graph-data');
          setGraphData(res.data);
        } catch (error) {
          console.error('Error loading graph data:', error);
        } finally {
          setGraphLoading(false);
        }
      };
    `
  }
};

// Helper function to identify page type
export const identifyPageType = (pageContent) => {
  const patterns = {
    table: /GenericTable/,
    kpi: /KPISection/,
    graph: /(BarGraph|LineGraph)/,
    card: /CardLoader/
  };
  
  const types = [];
  Object.entries(patterns).forEach(([type, pattern]) => {
    if (pattern.test(pageContent)) {
      types.push(type);
    }
  });
  
  return types;
};

// Helper function to generate migration steps
export const generateMigrationSteps = (pageName, pageType) => {
  const steps = [
    `1. Remove full-page loading: if (loading) return <Loading />;`,
    `2. Add granular loading states for ${pageType.join(', ')}`,
    `3. Split data fetching into separate functions`,
    `4. Update component props to include loading states`,
    `5. Test loading states independently`
  ];
  
  return steps;
};

// Example migration for a typical page
export const exampleMigration = `
// BEFORE:
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  Promise.all([...])
    .then(...)
    .finally(() => setLoading(false));
}, []);

if (loading) return <Loading />;

// AFTER:
const [tableLoading, setTableLoading] = useState(true);
const [kpisLoading, setKpisLoading] = useState(true);

useEffect(() => {
  loadTableData();
  loadKPIs();
}, []);

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

// Remove: if (loading) return <Loading />;

// Update components:
<KPISection kpis={kpis} loading={kpisLoading} />
<GenericTable data={tableData} loading={tableLoading} />
`;

export default {
  PAGES_TO_MIGRATE,
  MIGRATION_PATTERNS,
  identifyPageType,
  generateMigrationSteps,
  exampleMigration
}; 