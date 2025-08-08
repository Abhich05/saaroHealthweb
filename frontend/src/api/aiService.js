import axiosInstance from './axiosInstance';

class AIService {
  constructor() {
    this.baseURL = '/api';
  }

  // Get AI chat response
  async getChatResponse(doctorId, message, conversationHistory = []) {
    try {
      const response = await axiosInstance.post(`/${doctorId}/ai/chat`, {
        message,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }

  // Analyze symptoms
  async analyzeSymptoms(doctorId, symptoms) {
    try {
      const response = await axiosInstance.post(`/${doctorId}/ai/analyze-symptoms`, {
        symptoms
      });
      return response.data;
    } catch (error) {
      console.error('Symptoms Analysis Error:', error);
      throw error;
    }
  }

  // Get medication information
  async getMedicationInfo(doctorId, medication) {
    try {
      const response = await axiosInstance.post(`/${doctorId}/ai/medication-info`, {
        medication
      });
      return response.data;
    } catch (error) {
      console.error('Medication Info Error:', error);
      throw error;
    }
  }

  // Suggest diagnostic tests
  async suggestDiagnosticTests(doctorId, symptoms) {
    try {
      const response = await axiosInstance.post(`/${doctorId}/ai/suggest-tests`, {
        symptoms
      });
      return response.data;
    } catch (error) {
      console.error('Test Suggestions Error:', error);
      throw error;
    }
  }

  // Get AI capabilities
  async getCapabilities(doctorId) {
    try {
      const response = await axiosInstance.get(`/${doctorId}/ai/capabilities`);
      return response.data;
    } catch (error) {
      console.error('Capabilities Error:', error);
      throw error;
    }
  }

  // Quick medical query helper
  async quickQuery(doctorId, query) {
    try {
      const response = await axiosInstance.post(`/${doctorId}/ai/chat`, {
        message: query,
        conversationHistory: []
      });
      return response.data;
    } catch (error) {
      console.error('Quick Query Error:', error);
      throw error;
    }
  }
}

export default new AIService();
