const axios = require('axios');

class AIService {
  constructor() {
    // You can replace this with your preferred AI service (OpenAI, Claude, etc.)
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.useExternalAI = !!this.apiKey;
  }

  async generateResponse(userMessage, conversationHistory = []) {
    try {
      // If no API key is configured, use a fallback response system
      if (!this.useExternalAI) {
        console.log('Using fallback AI responses (no external AI API configured)');
        return this.getFallbackResponse(userMessage);
      }

      const messages = [
        {
          role: "system",
          content: `You are a helpful medical AI assistant designed to help doctors. You can:
          - Provide information about symptoms, diseases, and treatments
          - Help with medical terminology and explanations
          - Suggest diagnostic considerations
          - Offer guidance on common medical procedures
          - Help with medication information and interactions
          
          Always be professional, accurate, and remind users to consult with qualified healthcare professionals for specific medical advice.`
        },
        ...conversationHistory.map(msg => ({
          role: msg.from === 'doctor' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      console.log('Falling back to local responses');
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Medical knowledge base for common queries
    const responses = {
      'fever': 'Fever is typically a sign of infection. Common causes include viral infections, bacterial infections, and inflammatory conditions. Monitor temperature and watch for other symptoms. Consider consulting a healthcare provider if fever persists or is accompanied by severe symptoms.',
      
      'headache': 'Headaches can have various causes including tension, migraine, sinus issues, or more serious conditions. Consider factors like stress, dehydration, eye strain, or underlying medical conditions. Persistent or severe headaches should be evaluated by a healthcare professional.',
      
      'cough': 'Coughs can be caused by respiratory infections, allergies, asthma, or other conditions. Consider the type (dry vs productive), duration, and associated symptoms. Persistent coughs should be evaluated, especially if accompanied by other concerning symptoms.',
      
      'diabetes': 'Diabetes is a chronic condition affecting blood sugar regulation. Type 1 involves insulin deficiency, while Type 2 involves insulin resistance. Management includes diet, exercise, medication, and regular monitoring. Regular check-ups are essential.',
      
      'hypertension': 'Hypertension (high blood pressure) is a common condition that can lead to serious complications. Management includes lifestyle modifications (diet, exercise, stress reduction) and medication when necessary. Regular monitoring is important.',
      
      'antibiotics': 'Antibiotics are medications that fight bacterial infections. They should only be used when prescribed by a healthcare provider for bacterial infections. Overuse can lead to antibiotic resistance. Always complete the full course as prescribed.',
      
      'vaccination': 'Vaccinations are crucial for preventing infectious diseases. They work by stimulating the immune system to recognize and fight specific pathogens. Regular vaccination schedules help protect individuals and communities.',
      
      'pain management': 'Pain management involves various approaches including medications, physical therapy, lifestyle modifications, and alternative therapies. Treatment should be tailored to the individual and the specific type of pain.',
      
      'emergency': 'In medical emergencies, call emergency services immediately. Common emergency symptoms include chest pain, severe bleeding, difficulty breathing, sudden severe headache, and loss of consciousness. When in doubt, seek immediate medical attention.',
      
      'medication': 'Medications should be taken exactly as prescribed. Important considerations include timing, interactions with other medications, side effects, and storage requirements. Always consult with healthcare providers about medication concerns.',
      
      'diagnosis': 'Medical diagnosis involves evaluating symptoms, medical history, physical examination, and often laboratory or imaging tests. Accurate diagnosis is crucial for appropriate treatment. Always consult qualified healthcare professionals for diagnosis.',
      
      'treatment': 'Medical treatment should be evidence-based and tailored to individual patients. Considerations include the condition, patient factors, potential side effects, and monitoring requirements. Regular follow-up is often necessary.',
      
      'prevention': 'Preventive healthcare includes regular check-ups, vaccinations, healthy lifestyle choices, and early detection of conditions. Prevention is often more effective and less costly than treatment.',
      
      'symptoms': 'Symptoms are subjective experiences that may indicate underlying conditions. Evaluation should consider the nature, duration, severity, and associated symptoms. Some symptoms require immediate attention while others may be managed with monitoring.',
      
      'test': 'Medical tests help diagnose conditions, monitor treatment, and assess health status. Common tests include blood work, imaging, and specialized procedures. Results should be interpreted in the context of the individual patient.',
      
      'follow-up': 'Follow-up care is important for monitoring treatment effectiveness, managing chronic conditions, and detecting complications early. Regular follow-up appointments help ensure optimal health outcomes.',
      
      'referral': 'Medical referrals are made when specialized care is needed. This may involve specialists, diagnostic procedures, or specialized treatments. Referrals help ensure patients receive appropriate care for their specific needs.',
      
      'consultation': 'Medical consultations involve discussing health concerns with healthcare providers. Good communication is essential for accurate diagnosis and effective treatment. Prepare questions and relevant information for consultations.',
      
      'monitoring': 'Health monitoring involves regular assessment of various parameters like blood pressure, blood sugar, weight, or other relevant measures. Monitoring helps track progress and detect changes that may require attention.',
      
      'lifestyle': 'Lifestyle factors significantly impact health. Important considerations include diet, exercise, sleep, stress management, and avoiding harmful habits. Positive lifestyle changes can improve many health conditions.',
      
      'recovery': 'Recovery from illness or injury involves time, appropriate care, and often lifestyle modifications. Recovery timelines vary and should be guided by healthcare providers. Patience and adherence to recommendations are important.',
      
      'analyze': 'I can help analyze symptoms and provide general considerations. For accurate diagnosis and treatment, please consult with a healthcare professional who can evaluate the specific situation.',
      
      'medication info': 'I can provide general information about medications, but for specific dosing, interactions, or prescription information, please consult with a pharmacist or healthcare provider.',
      
      'diagnostic test': 'Diagnostic tests should be determined by healthcare providers based on individual patient factors and clinical presentation. I can provide general information about common tests.',
      
      'medical term': 'I can help explain medical terminology and concepts. Understanding medical terms can help with patient communication and documentation.',
      
      'treatment guideline': 'Treatment guidelines are evidence-based recommendations for managing various conditions. They should be adapted to individual patient needs and circumstances.',
      
      'emergency sign': 'Recognizing emergency signs is crucial. Common emergency symptoms include chest pain, severe bleeding, difficulty breathing, sudden severe headache, and loss of consciousness.'
    };

    // Find the best matching response
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response;
      }
    }

    // Default response for general queries
    return `I understand you're asking about "${userMessage}". As a medical AI assistant, I can help with general medical information, but for specific medical advice, diagnosis, or treatment recommendations, please consult with a qualified healthcare professional. What specific aspect would you like to know more about?`;
  }

  async analyzeSymptoms(symptoms) {
    try {
      const response = await this.generateResponse(
        `Analyze these symptoms and provide possible considerations: ${symptoms}. Focus on common causes, red flags to watch for, and when to seek medical attention.`
      );
      return response;
    } catch (error) {
      return 'I can help analyze symptoms, but for accurate diagnosis and treatment, please consult with a healthcare professional.';
    }
  }

  async getMedicationInfo(medication) {
    try {
      const response = await this.generateResponse(
        `Provide information about the medication: ${medication}. Include common uses, typical side effects, important considerations, and general information.`
      );
      return response;
    } catch (error) {
      return 'For specific medication information, please consult with a pharmacist or healthcare provider.';
    }
  }

  async suggestDiagnosticTests(symptoms) {
    try {
      const response = await this.generateResponse(
        `Based on these symptoms: ${symptoms}, what diagnostic tests might be considered? Provide general information about common tests that might be relevant.`
      );
      return response;
    } catch (error) {
      return 'Diagnostic testing should be determined by healthcare providers based on individual patient factors and clinical presentation.';
    }
  }
}

module.exports = new AIService();
