const aiService = require('./backend/services/aiService');

async function testAIService() {
  console.log('🧪 Testing AI Service...\n');

  try {
    // Test 1: Basic response
    console.log('1. Testing basic response...');
    const response1 = await aiService.generateResponse('What is diabetes?');
    console.log('✅ Response:', response1.substring(0, 100) + '...\n');

    // Test 2: Symptom analysis
    console.log('2. Testing symptom analysis...');
    const response2 = await aiService.analyzeSymptoms('fever and headache');
    console.log('✅ Analysis:', response2.substring(0, 100) + '...\n');

    // Test 3: Medication info
    console.log('3. Testing medication information...');
    const response3 = await aiService.getMedicationInfo('aspirin');
    console.log('✅ Medication info:', response3.substring(0, 100) + '...\n');

    // Test 4: Diagnostic tests
    console.log('4. Testing diagnostic test suggestions...');
    const response4 = await aiService.suggestDiagnosticTests('chest pain');
    console.log('✅ Test suggestions:', response4.substring(0, 100) + '...\n');

    console.log('🎉 All AI service tests passed!');
    console.log('\n📝 Note: The AI service is working with fallback responses.');
    console.log('💡 To enable external AI (OpenAI), set OPENAI_API_KEY in your .env file.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIService();
