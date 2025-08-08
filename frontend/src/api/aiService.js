import axiosInstance from './axiosInstance';

class AIService {
  constructor() {
    this.baseURL = '/api';
  }

  // Get AI chat response
  async getChatResponse(doctorId, message, conversationHistory = []) {
    try {
      console.log('AI Service - Making request:', {
        doctorId,
        message,
        conversationHistoryLength: conversationHistory.length,
        url: `/${doctorId}/ai/chat`
      });

      const response = await axiosInstance.post(`/${doctorId}/ai/chat`, {
        message,
        conversationHistory
      });

      console.log('AI Service - Response received:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        messageLength: response.data?.data?.message?.length
      });

      return response.data;
    } catch (error) {
      console.error('AI Service - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  }

  // Analyze symptoms
  async analyzeSymptoms(doctorId, symptoms) {
    try {
      console.log('AI Service - Analyzing symptoms:', { doctorId, symptoms });
      
      const response = await axiosInstance.post(`/${doctorId}/ai/analyze-symptoms`, {
        symptoms
      });
      
      console.log('AI Service - Symptoms analysis response:', {
        success: response.data?.success,
        hasData: !!response.data?.data
      });
      
      return response.data;
    } catch (error) {
      console.error('AI Service - Symptoms analysis error:', error.message);
      throw error;
    }
  }

  // Get medication information
  async getMedicationInfo(doctorId, medication) {
    try {
      console.log('AI Service - Getting medication info:', { doctorId, medication });
      
      const response = await axiosInstance.post(`/${doctorId}/ai/medication-info`, {
        medication
      });
      
      console.log('AI Service - Medication info response:', {
        success: response.data?.success,
        hasData: !!response.data?.data
      });
      
      return response.data;
    } catch (error) {
      console.error('AI Service - Medication info error:', error.message);
      throw error;
    }
  }

  // Suggest diagnostic tests
  async suggestDiagnosticTests(doctorId, symptoms) {
    try {
      console.log('AI Service - Suggesting diagnostic tests:', { doctorId, symptoms });
      
      const response = await axiosInstance.post(`/${doctorId}/ai/suggest-tests`, {
        symptoms
      });
      
      console.log('AI Service - Diagnostic tests response:', {
        success: response.data?.success,
        hasData: !!response.data?.data
      });
      
      return response.data;
    } catch (error) {
      console.error('AI Service - Diagnostic tests error:', error.message);
      throw error;
    }
  }

  // Get AI capabilities
  async getCapabilities(doctorId) {
    try {
      console.log('AI Service - Getting capabilities:', { doctorId });
      
      const response = await axiosInstance.get(`/${doctorId}/ai/capabilities`);
      
      console.log('AI Service - Capabilities response:', {
        success: response.data?.success,
        hasData: !!response.data?.data
      });
      
      return response.data;
    } catch (error) {
      console.error('AI Service - Capabilities error:', error.message);
      throw error;
    }
  }

  // Quick medical query helper
  async quickQuery(doctorId, query) {
    try {
      console.log('AI Service - Quick query:', { doctorId, query });
      
      const response = await axiosInstance.post(`/${doctorId}/ai/chat`, {
        message: query,
        conversationHistory: []
      });
      
      console.log('AI Service - Quick query response:', {
        success: response.data?.success,
        hasData: !!response.data?.data
      });
      
      return response.data;
    } catch (error) {
      console.error('AI Service - Quick query error:', error.message);
      throw error;
    }
  }
}

export default new AIService();
