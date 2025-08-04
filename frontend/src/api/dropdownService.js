import axiosInstance from './axiosInstance';

export const dropdownService = {
  // Get all dropdowns for a doctor
  getAllDropdowns: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/doctor/${doctorId}/dropdown`);
      return response.data.dropdowns || [];
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
      return [];
    }
  },

  // Get dropdowns grouped by section
  getDropdownsGroupedBySection: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/doctor/${doctorId}/dropdown/grouped`);
      return response.data.dropdowns || [];
    } catch (error) {
      console.error('Error fetching grouped dropdowns:', error);
      return [];
    }
  },

  // Get dropdowns for a specific section
  getDropdownsBySection: async (doctorId, sectionId) => {
    try {
      const response = await axiosInstance.get(`/doctor/${doctorId}/dropdown/section/${sectionId}`);
      return response.data.dropdowns || [];
    } catch (error) {
      console.error('Error fetching dropdowns by section:', error);
      return [];
    }
  },

  // Add new dropdown entry
  addDropdown: async (doctorId, dropdownData) => {
    try {
      const response = await axiosInstance.post(`/doctor/${doctorId}/dropdown`, dropdownData);
      return response.data.dropdown;
    } catch (error) {
      console.error('Error adding dropdown:', error);
      throw error;
    }
  },

  // Update dropdown entry
  updateDropdown: async (doctorId, dropdownId, dropdownData) => {
    try {
      const response = await axiosInstance.put(`/doctor/${doctorId}/dropdown/${dropdownId}`, dropdownData);
      return response.data.dropdown;
    } catch (error) {
      console.error('Error updating dropdown:', error);
      throw error;
    }
  },

  // Delete dropdown entry
  deleteDropdown: async (doctorId, dropdownId) => {
    try {
      const response = await axiosInstance.delete(`/doctor/${doctorId}/dropdown/${dropdownId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dropdown:', error);
      throw error;
    }
  },

  // Get dropdown options for a specific section (for use in forms)
  getOptionsForSection: async (doctorId, sectionId) => {
    try {
      const dropdowns = await dropdownService.getDropdownsBySection(doctorId, sectionId);
      return dropdowns.map(dropdown => ({
        value: dropdown.name,
        label: dropdown.name,
        id: dropdown._id
      }));
    } catch (error) {
      console.error('Error getting options for section:', error);
      return [];
    }
  },

  // Get all dropdown options grouped by section (for use in forms)
  getAllOptionsGrouped: async (doctorId) => {
    try {
      const groupedDropdowns = await dropdownService.getDropdownsGroupedBySection(doctorId);
      const options = {};
      
      groupedDropdowns.forEach(section => {
        options[section.sectionId] = section.options.map(option => ({
          value: option.name,
          label: option.name,
          id: option.id
        }));
      });
      
      return options;
    } catch (error) {
      console.error('Error getting all grouped options:', error);
      return {};
    }
  }
};

export default dropdownService; 