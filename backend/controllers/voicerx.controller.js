const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `voice_recording_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'), false);
    }
  }
});

// Medical entity extraction patterns
const medicalPatterns = {
  symptoms: [
    /(?:complains? of|suffers? from|has|experiencing|reports?|symptoms?|presenting with)\s+([^.]+)/gi,
    /(?:pain|ache|fever|cough|headache|nausea|vomiting|diarrhea|constipation|fatigue|weakness)\s*(?:in|of)?\s*([^.]*)/gi
  ],
  medications: [
    /(?:prescribe[d]?|give|take|administer|medication)\s+([^.]+?)(?:\s+(?:\d+(?:\.\d+)?)\s*(?:mg|ml|tablets?|capsules?))?/gi,
    /([A-Z][a-z]+(?:cillin|mycin|prazole|olol|sartan|statin))\s*(?:\d+(?:\.\d+)?\s*(?:mg|ml))?/gi
  ],
  investigations: [
    /(?:order|request|get|do|perform)\s+(?:a\s+)?([^.]*?(?:test|scan|x-ray|blood|urine|culture|biopsy|ecg|echo|mri|ct|ultrasound))/gi,
    /(?:blood test|urine test|x-ray|ct scan|mri|ultrasound|ecg|echo|biopsy|culture)\s*(?:of\s+)?([^.]*)/gi
  ],
  instructions: [
    /(?:advice|recommend|suggest|instruct|tell)\s+(?:patient\s+)?(?:to\s+)?([^.]+)/gi,
    /(?:should|need to|must|important to)\s+([^.]+)/gi
  ],
  followUp: [
    /(?:follow[- ]?up|review|recheck|return|come back|see again)\s+(?:in\s+)?([^.]+)/gi,
    /(?:next appointment|next visit)\s+(?:in\s+)?([^.]+)/gi
  ]
};

// Extract medical entities from transcript
const extractMedicalEntities = (transcript) => {
  const entities = {
    symptoms: [],
    medications: [],
    investigations: [],
    instructions: [],
    followUp: []
  };

  const text = transcript.toLowerCase();

  // Extract each type of entity
  Object.keys(medicalPatterns).forEach(category => {
    medicalPatterns[category].forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const extracted = match[1]?.trim();
        if (extracted && extracted.length > 2) {
          // Clean up the extracted text
          const cleaned = extracted
            .replace(/^(and|or|the|a|an)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleaned && !entities[category].includes(cleaned)) {
            entities[category].push(cleaned);
          }
        }
      }
      // Reset regex lastIndex
      pattern.lastIndex = 0;
    });
  });

  return entities;
};

// Detect explicitly labeled sections like "Diagnosis:", "Instructions:", etc.
const labeledSectionKeywords = [
  'patient information',
  'chief complaint',
  'symptoms',
  'diagnosis',
  'assessment',
  'plan',
  'medications',
  'medication',
  'prescription',
  'investigations',
  'tests',
  'instructions',
  'advice',
  'follow-up',
  'follow up',
  'allergies',
  'vitals',
  'history',
  'examination'
];

// Build a regex that captures labeled blocks until the next known label or end
const buildLabeledRegex = () => {
  const labelGroup = labeledSectionKeywords
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  // e.g., "Diagnosis:" or "Diagnosis -" or "Diagnosis ." variants
  return new RegExp(
    `(?:^|\n|\.|\s)(?:(${labelGroup}))\s*[:\-]?\s*([^\n\.]+(?:[\n\r]+(?!${labelGroup}).+)*)`,
    'gi'
  );
};

const labeledRegex = buildLabeledRegex();

const normalizeLabel = (label) => {
  return label
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace('follow up', 'follow-up');
};

// Attempt to split values into arrays for list-like sections
const listyKeys = new Set([
  'symptoms', 'diagnosis', 'assessment', 'plan', 'medications', 'medication', 'prescription', 'investigations', 'tests', 'instructions', 'advice', 'allergies'
]);

const splitToArrayIfList = (key, value) => {
  const val = (value || '').replace(/\s+/g, ' ').trim();
  if (!val) return [];
  if (listyKeys.has(key)) {
    // Split on common delimiters
    return val
      .split(/\s*[;,\n]\s+|\s+and\s+|\s*\u2022\s*/i)
      .map(s => s.replace(/^[-•\s]+/, '').trim())
      .filter(Boolean);
  }
  return val;
};

const extractLabeledSections = (transcript) => {
  const sections = {};
  if (!transcript) return sections;
  const text = transcript;
  let match;
  // Reset lastIndex in case of reuse
  labeledRegex.lastIndex = 0;
  while ((match = labeledRegex.exec(text)) !== null) {
    const rawLabel = match[1] || '';
    const content = (match[2] || '').trim();
    const key = normalizeLabel(rawLabel);
    if (!key) continue;
    const normalized = splitToArrayIfList(key, content);
    // Prefer arrays for list-like keys; else string
    sections[key] = normalized;
  }
  return sections;
};

// Format prescription text
const formatPrescription = (entities, doctorInfo, patientInfo) => {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  return `
DIGITAL PRESCRIPTION
${'='.repeat(50)}

PATIENT INFORMATION:
- Name: ${patientInfo.name || 'Patient'}
- Age: ${patientInfo.age || 'Unknown'}
- Gender: ${patientInfo.gender || 'Unknown'}
- Date: ${date} ${time}

CHIEF COMPLAINTS & SYMPTOMS:
${entities.symptoms.length > 0 
  ? entities.symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')
  : '• No specific symptoms recorded'}

MEDICATIONS PRESCRIBED:
${entities.medications.length > 0
  ? entities.medications.map((m, i) => `\n${i + 1}. ${m}\n   - Dosage: As prescribed\n   - Frequency: As directed\n   - Duration: As prescribed`).join('\n')
  : '• No medications prescribed'}

INVESTIGATIONS ORDERED:
${entities.investigations.length > 0
  ? entities.investigations.map((inv, i) => `${i + 1}. ${inv} - Date: ${date}`).join('\n')
  : '• No investigations ordered'}

GENERAL INSTRUCTIONS:
${entities.instructions.length > 0
  ? entities.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')
  : '• Follow standard medical care guidelines\n• Take adequate rest\n• Maintain proper hydration'}

FOLLOW-UP:
${entities.followUp.length > 0
  ? entities.followUp.map((f, i) => `${i + 1}. ${f}`).join('\n')
  : '• As needed'}

DOCTOR INFORMATION:
- Dr. ${doctorInfo.name || 'Unknown'}
- Specialty: ${doctorInfo.specialty || 'General Practice'}
- Registration: ${doctorInfo.registration || 'Not specified'}

Generated by Voice Rx AI System
${'='.repeat(50)}
  `.trim();
};

// Mock speech-to-text function (replace with actual ASR service)
const mockSpeechToText = async (audioFilePath) => {
  // This is a mock implementation
  // In production, you would integrate with a real speech-to-text service
  // like Google Speech-to-Text, Azure Speech Services, or AWS Transcribe
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock transcript for demonstration
      const mockTranscripts = [
        "Patient complains of fever and body ache for the past 3 days. Prescribe paracetamol 500mg twice daily for 5 days. Order complete blood count and throat swab. Advice increased fluid intake and rest.",
        "Patient has headache and nausea. Give paracetamol 500mg three times daily. Patient should take rest and follow up after 3 days if symptoms persist.",
        "Patient suffers from cough and sore throat. Prescribe azithromycin 500mg once daily for 3 days. Order chest x-ray if needed. Recommend warm salt water gargling."
      ];
      
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      resolve(randomTranscript);
    }, 2000); // Simulate processing time
  });
};

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    res.json({
      status: 'ok',
      service: 'VoiceRx Controller',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
};

// Process audio and generate prescription
const processAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided'
      });
    }

    const { doctorId, patientId, storeResult = false } = req.body;
    const audioFilePath = req.file.path;

    // Extract doctor and patient info (you might want to fetch from database)
    const doctorInfo = {
      name: req.body.doctorName || 'Dr. Unknown',
      specialty: req.body.doctorSpecialty || 'General Practice',
      registration: req.body.doctorRegistration || 'Not specified'
    };

    const patientInfo = {
      name: req.body.patientName || 'Patient',
      age: req.body.patientAge || 'Unknown',
      gender: req.body.patientGender || 'Unknown'
    };

    // Convert audio to text (mock implementation)
    const transcript = await mockSpeechToText(audioFilePath);

    // Extract medical entities and labeled sections
    const entities = extractMedicalEntities(transcript);
    const labeledSections = extractLabeledSections(transcript);

    // Generate formatted prescription
    const prescriptionText = formatPrescription(entities, doctorInfo, patientInfo);

    // Create sections for frontend
    // Prefer explicitly labeled sections; fallback to entity-derived sections
    let sections = {};
    if (Object.keys(labeledSections).length > 0) {
      // Convert keys to Title Case labels expected by frontend
      sections = Object.entries(labeledSections).reduce((acc, [k, v]) => {
        const label = k.replace(/\b\w/g, (m) => m.toUpperCase());
        acc[label] = Array.isArray(v) ? v : String(v || '');
        return acc;
      }, {});
      // Ensure common sections are present if missing
      if (!sections['Symptoms'] && entities.symptoms.length) sections['Symptoms'] = entities.symptoms;
      if (!sections['Medication'] && entities.medications.length) sections['Medication'] = entities.medications;
      if (!sections['Investigations'] && entities.investigations.length) sections['Investigations'] = entities.investigations;
      if (!sections['Instructions'] && entities.instructions.length) sections['Instructions'] = entities.instructions;
      if (!sections['Follow-Up'] && entities.followUp.length) sections['Follow-Up'] = entities.followUp;
    } else {
      sections = {
        'Symptoms': entities.symptoms,
        'Medication': entities.medications,
        'Investigations': entities.investigations,
        'Instructions': entities.instructions,
        'Follow-Up': entities.followUp
      };
    }

    // Clean up uploaded file
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error('Error deleting audio file:', err);
    });

    // Store result if requested (implement database storage here)
    let stored = null;
    if (storeResult === 'true' || storeResult === true) {
      // TODO: Implement database storage
      stored = {
        ok: true,
        id: `rx_${Date.now()}`
      };
    }

    res.json({
      result: {
        transcript,
        sections,
        entities,
        prescriptionText,
        confidence_overall: 0.85,
        clarifications: []
      },
      stored
    });

  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({
      error: 'Failed to process audio',
      message: error.message
    });
  }
};

// Save prescription to database
const savePrescription = async (req, res) => {
  try {
    const { doctorId, patientId, prescriptionData } = req.body;

    // TODO: Implement database save logic
    // This would typically save to your prescriptions table

    const savedPrescription = {
      id: `rx_${Date.now()}`,
      doctorId,
      patientId,
      prescriptionData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    res.json({
      success: true,
      prescription: savedPrescription
    });

  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({
      error: 'Failed to save prescription',
      message: error.message
    });
  }
};

module.exports = {
  upload,
  healthCheck,
  processAudio,
  savePrescription
};
