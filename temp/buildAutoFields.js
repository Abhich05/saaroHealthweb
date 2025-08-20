// Helper to build dynamic fields from sections/entities
const buildAutoFields = (data) => {
  if (!data || typeof data !== 'object') return [];
  const fields = [];
  
  // Handle the backend's response structure
  if (data.sections) {
    // Use sections for field generation
    Object.entries(data.sections).forEach(([key, val]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
      
      if (typeof val === 'string') {
        const long = val.length > 80 || val.includes('\n');
        fields.push({ key, label, type: long ? 'textarea' : 'text', values: [val] });
      }
    });
  } else if (data.entities) {
    // Fallback to entities
    Object.entries(data.entities).forEach(([key, val]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
      
      if (Array.isArray(val)) {
        fields.push({ key, label, type: 'list', values: val.map(v => String(v)) });
      } else if (typeof val === 'string') {
        const long = val.length > 80 || val.includes('\n');
        fields.push({ key, label, type: long ? 'textarea' : 'text', values: [val] });
      } else if (val && typeof val === 'object') {
        // Flatten shallow objects into key: value lines
        const flat = Object.entries(val).map(([k, v]) => `${k}: ${v}`);
        fields.push({ key, label, type: 'list', values: flat });
      }
    });
  } else {
    // Handle regular key-value pairs
    Object.entries(data).forEach(([key, val]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
      
      if (Array.isArray(val)) {
        fields.push({ key, label, type: 'list', values: val.map(v => String(v)) });
      } else if (typeof val === 'string') {
        const long = val.length > 80 || val.includes('\n');
        fields.push({ key, label, type: long ? 'textarea' : 'text', values: [val] });
      } else if (val && typeof val === 'object' && !val.hasOwnProperty('label')) {
        // Flatten shallow objects into key: value lines
        const flat = Object.entries(val).map(([k, v]) => `${k}: ${v}`);
        fields.push({ key, label, type: 'list', values: flat });
      }
    });
  }
  
  return fields;
};
