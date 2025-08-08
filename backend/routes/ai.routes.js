const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const doctorMiddleware = require('../middlewares/doctor.middleware');

// Get AI chat response
router.post('/chat', doctorMiddleware, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const doctorId = req.params.doctorId;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(message, conversationHistory);

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
});

// Analyze symptoms
router.post('/analyze-symptoms', doctorMiddleware, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const doctorId = req.params.doctorId;

    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    const analysis = await aiService.analyzeSymptoms(symptoms);

    res.json({
      success: true,
      data: {
        analysis: analysis,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Symptoms Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze symptoms',
      error: error.message
    });
  }
});

// Get medication information
router.post('/medication-info', doctorMiddleware, async (req, res) => {
  try {
    const { medication } = req.body;
    const doctorId = req.params.doctorId;

    if (!medication || medication.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required'
      });
    }

    const medicationInfo = await aiService.getMedicationInfo(medication);

    res.json({
      success: true,
      data: {
        medication: medication,
        information: medicationInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Medication Info Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medication information',
      error: error.message
    });
  }
});

// Suggest diagnostic tests
router.post('/suggest-tests', doctorMiddleware, async (req, res) => {
  try {
    const { symptoms } = req.body;
    const doctorId = req.params.doctorId;

    if (!symptoms || symptoms.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    const testSuggestions = await aiService.suggestDiagnosticTests(symptoms);

    res.json({
      success: true,
      data: {
        symptoms: symptoms,
        suggestions: testSuggestions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Test Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suggest diagnostic tests',
      error: error.message
    });
  }
});

// Get AI capabilities
router.get('/capabilities', doctorMiddleware, async (req, res) => {
  try {
    const capabilities = {
      features: [
        'General medical information and education',
        'Symptom analysis and possible considerations',
        'Medication information and interactions',
        'Diagnostic test suggestions',
        'Medical terminology explanations',
        'Treatment guidance and best practices',
        'Preventive healthcare information',
        'Emergency medical guidance'
      ],
      limitations: [
        'Cannot provide specific medical diagnoses',
        'Cannot replace professional medical advice',
        'Cannot prescribe medications',
        'Information is for educational purposes only',
        'Always consult healthcare professionals for specific advice'
      ],
      disclaimer: 'This AI assistant provides general medical information for educational purposes. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for specific medical concerns.'
    };

    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    console.error('Capabilities Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI capabilities',
      error: error.message
    });
  }
});

module.exports = router;
