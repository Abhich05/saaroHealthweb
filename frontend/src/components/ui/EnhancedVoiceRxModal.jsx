import React, { useState, useEffect, useRef, useMemo } from 'react';
import Modal from './GenericModal';
import Button from './Button';
import { FiMic, FiStopCircle, FiPlay, FiPause, FiSave, FiEdit3, FiPrinter, FiDownload } from 'react-icons/fi';
import { FaMicrophone } from 'react-icons/fa';
import voiceService from '../../api/voiceService';
import '../../styles/voicerx-brand.css';

/**
 * Enhanced VoiceRx Modal - Integrates the standalone voicerx system with brand colors
 * Combines the UI/UX from the voicerx folder with the existing modal functionality
 */

const EnhancedVoiceRxModal = ({ isOpen, onClose, onApply, doctorId, patientId }) => {
  // Session and UI state
  const [currentStep, setCurrentStep] = useState('start'); // start, recording, processing, generated, results
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Tips data for carousel
  const tips = [
    {
      title: "Stay Focused",
      content: "Stick to only prescription details. Avoid irrelevant information for clear and precise dictation."
    },
    {
      title: "Speak Clearly",
      content: "Enunciate medical terms clearly. The AI works best with natural, conversational speech."
    },
    {
      title: "Include Key Details",
      content: "Mention medication names, dosages, frequency, and duration. Include symptoms and diagnosis."
    },
    {
      title: "Use Medical Terminology",
      content: "When possible, use standard medical terms for conditions, medications, and instructions."
    }
  ];
  
  // Carousel state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Auto-rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prevIndex => (prevIndex + 1) % tips.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [tips.length]);

  // Doctor and Patient info
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. John Smith',
    specialty: 'General Medicine',
    registration: 'REG123456'
  });
  
  const [patientInfo, setPatientInfo] = useState({
    name: 'Patient',
    age: '',
    gender: ''
  });

  // Audio and transcription
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [waveformBars, setWaveformBars] = useState(Array(20).fill(0));

  // Prescription data
  const [prescriptionData, setPrescriptionData] = useState({
    symptoms: [],
    medications: [],
    investigations: [],
    instructions: []
  });

  // Generated prescription text
  const [generatedPrescription, setGeneratedPrescription] = useState('');
  
  // Generated form structure
  const [generatedForm, setGeneratedForm] = useState({
    patientInfo: { name: '', age: '', gender: '' },
    symptoms: [],
    diagnosis: [],
    medications: [],
    investigations: [],
    instructions: [],
    followUp: ''
  });
  
  // Dynamically generated fields from AI (label + input(s))
  // Each item: { key, label, type: 'text'|'textarea'|'list', values: string[] }
  const [autoFields, setAutoFields] = useState([]);

  // Helper to build dynamic fields from sections/entities
  const buildAutoFields = (data) => {
    if (!data || typeof data !== 'object') return [];
    const fields = [];
    
    // Helper to normalize label casing
    const humanize = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    // Helper to push a field with auto type based on content length
    const pushField = (key, label, val) => {
      if (val == null) return;
      if (Array.isArray(val)) {
        // Array of primitives or objects
        const values = val.map((v) => {
          if (typeof v === 'string') return v;
          if (v && typeof v === 'object') {
            // Try common shapes: {raw,name,dosage,...} or {label,value}
            if ('value' in v && typeof v.value === 'string') return v.value;
            if ('raw' in v && typeof v.raw === 'string') return v.raw;
            if ('name' in v && typeof v.name === 'string') return v.name;
            return Object.entries(v).map(([k, vv]) => `${humanize(k)}: ${vv}`).join(', ');
          }
          return String(v);
        });
        fields.push({ key, label, type: 'list', values });
      } else if (typeof val === 'string') {
        const long = val.length > 80 || val.includes('\n');
        fields.push({ key, label, type: long ? 'textarea' : 'text', values: [val] });
      } else if (val && typeof val === 'object') {
        // Handle ParsedField like {label, value}
        if ('value' in val || 'label' in val) {
          const effLabel = humanize(val.label || label);
          const v = val.value;
          if (Array.isArray(v)) {
            fields.push({ key, label: effLabel, type: 'list', values: v.map((x) => String(x)) });
          } else if (typeof v === 'string') {
            const long = v.length > 80 || v.includes('\n');
            fields.push({ key, label: effLabel, type: long ? 'textarea' : 'text', values: [v] });
          } else if (v && typeof v === 'object') {
            const flat = Object.entries(v).map(([k, vv]) => `${humanize(k)}: ${vv}`);
            fields.push({ key, label: effLabel, type: 'list', values: flat });
          }
        } else {
          console.debug('[VoiceRx] No fields/sections/entities; using local extraction');
          // Generic object: flatten
          const flat = Object.entries(val).map(([k, v]) => `${humanize(k)}: ${v}`);
          fields.push({ key, label, type: 'list', values: flat });
        }
      }
    };

    // Handle the backend's response structure
    if (data.sections) {
      Object.entries(data.sections).forEach(([key, val]) => {
        pushField(key, humanize(key), val);
      });
    } else if (data.entities) {
      Object.entries(data.entities).forEach(([key, val]) => {
        pushField(key, humanize(key), val);
      });
    } else {
      // Generic kv object
      Object.entries(data).forEach(([key, val]) => {
        pushField(key, humanize(key), val);
      });
    }
    
    return fields;
  };

  // Enrich autoFields with known data if values are empty
  const enrichAutoFields = (fields) => {
    if (!Array.isArray(fields)) return [];
    const fillFromArrays = (label) => {
      const lc = (label || '').toLowerCase();
      if (lc.includes('symptom')) return (prescriptionData.symptoms || []).map(String);
      if (lc.includes('medication') || lc.includes('drug') || lc.includes('rx')) return (prescriptionData.medications || []).map(String);
      if (lc.includes('instruction') || lc.includes('advice')) return (prescriptionData.instructions || []).map(String);
      if (lc.includes('investigation') || lc.includes('test')) return (prescriptionData.investigations || []).map(String);
      if (lc.includes('diagnosis')) return (generatedForm.diagnosis || []).map(String);
      if (lc.includes('patient name')) return [patientInfo.name || 'Patient'];
      return [];
    };

    const result = fields.map(f => {
      const hasValues = Array.isArray(f.values) && f.values.some(v => String(v).trim());
      if (hasValues) return f;
      const fallbackVals = fillFromArrays(f.label || f.key);
      if (fallbackVals.length === 0) return f;
      if (f.type === 'text' || f.type === 'textarea') {
        return { ...f, values: [fallbackVals[0] || ''] };
      }
      return { ...f, type: 'list', values: fallbackVals };
    });

    return result;
  };

  // Fallback: derive basic sections from raw transcript text
  const buildFieldsFromTranscript = (text) => {
    if (!text || typeof text !== 'string') return { fields: [], parts: {} };
    const t = text.trim();
    const lower = t.toLowerCase();

    // Helper: capture after label with or without colon, until sentence end
    const pickAfter = (labels) => {
      for (const label of labels) {
        const colonRe = new RegExp(`${label}\\s*:([^\n\.]+)`, 'i');
        const m1 = t.match(colonRe);
        if (m1) return m1[1].trim();
        const nonColonRe = new RegExp(`${label}\\s+([^\n\.]+)`, 'i');
        const m2 = t.match(nonColonRe);
        if (m2) return m2[1].trim();
      }
      return '';
    };

    const splitList = (s) => {
      if (!s) return [];
      // split on commas/semicolons/" and " / " then " phrases
      return s
        .split(/[,;]|\band\b|\bthen\b/gi)
        .map(x => x.trim())
        .filter(Boolean);
    };

    const symptomsStr = pickAfter(['symptoms', 'complaints', 'presenting complaints', 'symptom']);
    const medsStr = pickAfter(['medication', 'medications', 'rx', 'prescribe', 'drug']);
    const instrStr = pickAfter(['instructions', 'advice', 'recommendations', 'instruct']);

    const parts = {
      symptoms: splitList(symptomsStr),
      medications: splitList(medsStr),
      instructions: splitList(instrStr),
    };

    // If still empty, try heuristic sentences
    if (parts.symptoms.length === 0 && /symptom|complain|pain|fever|cough|ache|nausea/.test(lower)) {
      parts.symptoms = [t];
    }

    const humanize = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    const fields = [];
    if (parts.symptoms.length) fields.push({ key: 'symptoms', label: humanize('symptoms'), type: 'list', values: parts.symptoms });
    if (parts.medications.length) fields.push({ key: 'medications', label: humanize('medications'), type: 'list', values: parts.medications });
    if (parts.instructions.length) fields.push({ key: 'instructions', label: humanize('instructions'), type: 'list', values: parts.instructions });
    if (fields.length === 0) fields.push({ key: 'notes', label: 'Notes', type: 'textarea', values: [t] });

    return { fields: enrichAutoFields(fields), parts };
  };

  // Derive dynamic fields from the locally generated form as a fallback
  const deriveFieldsFromGeneratedForm = (form) => {
    if (!form || typeof form !== 'object') return [];
    const fields = [];
    const humanize = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

    // Patient info (object) -> flatten to list
    if (form.patientInfo && typeof form.patientInfo === 'object') {
      const flat = Object.entries(form.patientInfo).map(([k, v]) => `${humanize(k)}: ${v ?? ''}`);
      fields.push({ key: 'patient_info', label: 'Patient Info', type: 'list', values: flat });
    }

    // Arrays -> list fields
    const arrayKeys = ['symptoms', 'diagnosis', 'medications', 'investigations', 'instructions'];
    arrayKeys.forEach((key) => {
      if (Array.isArray(form[key]) && form[key].length) {
        fields.push({ key, label: humanize(key), type: 'list', values: form[key].map(String) });
      }
    });

    // Follow-up -> text
    if (typeof form.followUp === 'string' && form.followUp.trim()) {
      fields.push({ key: 'follow_up', label: 'Follow Up', type: 'text', values: [form.followUp] });
    }

    // If nothing was added, provide a minimal editable field so UI isn't empty
    if (fields.length === 0) {
      fields.push({ key: 'notes', label: 'Notes', type: 'textarea', values: [''] });
    }

    return fields;
  };

  // Refs
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  // Recording lifecycle helpers
  const blobReadyPromiseRef = useRef(null);
  const blobReadyResolveRef = useRef(null);

  // Speech Recognition setup
  const isSpeechSupported = useMemo(
    () => typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  // Waveform animation
  useEffect(() => {
    let animationFrame;
    if (isRecording && !isPaused) {
      const animate = () => {
        setWaveformBars(prev => prev.map(() => Math.random() * 100));
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isRecording, isPaused]);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // No auto-start; user controls start/stop explicitly

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (isOpen && isSpeechSupported && !recognitionRef.current) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onerror = (event) => {
          // Speech recognition error handling
        };

        recognition.onend = () => {
          // No auto-restart; user controls recording lifecycle
        };

        recognition.onresult = (event) => {
          let interim = '';
          let finalChunk = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += transcript;
            } else {
              interim += transcript;
            }
          }

          if (finalChunk.trim()) {
            const newTranscript = finalTranscriptRef.current + (finalTranscriptRef.current ? " " : "") + finalChunk;
            finalTranscriptRef.current = newTranscript.trim();
            setTranscript(finalTranscriptRef.current);
            
            // Process transcript for extraction only (no real-time updates)
            processTranscript(finalChunk.trim());
          }
          
          // Update current transcript with interim results
          const base = finalTranscriptRef.current;
          const currentText = ((base ? base + " " : "") + interim).trim();
          setCurrentTranscript(currentText);
        };

        recognitionRef.current = recognition;
      } catch (error) {
        // Failed to initialize speech recognition
      }
    }
  }, [isOpen, isSpeechSupported]);

  // Process transcript for medical entities (no auto-population)
  const processTranscript = (text) => {
    const lowerText = text.toLowerCase();
    
    // Extract symptoms
    const symptomKeywords = ['complains of', 'suffers from', 'has', 'experiencing', 'reports', 'symptoms', 'pain', 'ache'];
    const extractedSymptoms = [];
    symptomKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        const match = text.match(new RegExp(`${keyword}\\s+([^.]+)`, 'i'));
        if (match) {
          extractedSymptoms.push(match[1].trim());
        }
      }
    });

    // Extract medications
    const medKeywords = ['prescribe', 'give', 'take', 'administer', 'medication', 'tablet', 'capsule'];
    const extractedMedications = [];
    medKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        const match = text.match(new RegExp(`${keyword}\\s+([^.]+)`, 'i'));
        if (match) {
          extractedMedications.push(match[1].trim());
        }
      }
    });

    // Extract instructions
    const instructionKeywords = ['advice', 'recommend', 'suggest', 'instruct', 'tell patient'];
    const extractedInstructions = [];
    instructionKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        const match = text.match(new RegExp(`${keyword}\\s+([^.]+)`, 'i'));
        if (match) {
          extractedInstructions.push(match[1].trim());
        }
      }
    });

    // Update prescription data for display only
    setPrescriptionData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, ...extractedSymptoms],
      medications: [...prev.medications, ...extractedMedications],
      instructions: [...prev.instructions, ...extractedInstructions]
    }));
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Prepare a promise that resolves when MediaRecorder finishes and blob is set
      blobReadyPromiseRef.current = new Promise((resolve) => {
        blobReadyResolveRef.current = resolve;
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (blobReadyResolveRef.current) {
          try { blobReadyResolveRef.current(blob); } catch {}
          blobReadyResolveRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentStep('recording');
      setRecordingTime(0);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      // Error starting recording
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {}
    
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    } catch {}

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch {}

    setIsRecording(false);
    setCurrentStep('processing');

    // Wait for blob to be ready before processing
    try {
      if (blobReadyPromiseRef.current) {
        await blobReadyPromiseRef.current;
      }
    } catch {}
    
    // Process with backend service
    processWithBackendService();
  };

  // Process with backend service and generate structured form
  const processWithBackendService = async () => {
    if (!audioBlob) {
      // No audio blob available: build a local structured form from current state
      console.debug('[VoiceRx] No audioBlob; using generateStructuredForm fallback');
      generateStructuredForm();
      return;
    }

    try {
      const response = await voiceService.transcribeParse(audioBlob, {
        storeResult: false,
        patientId: patientId || null,
        doctorId: doctorId || null
      });

      if (response?.result) {
        console.debug('[VoiceRx] Backend result keys:', Object.keys(response.result));
        const { transcript: serverTranscript, sections, fields, entities, prescriptionText } = response.result;
        
        // Update transcript if we got one from server
        if (serverTranscript) {
          setTranscript(serverTranscript);
        }

        // Generate structured form from backend response
        // The backend returns fields with specific structure and sections as key-value pairs
        if (fields) {
          console.debug('[VoiceRx] Using fields path');
          // Convert fields to our form structure
          const symptoms = [];
          const medications = [];
          const investigations = [];
          const instructions = [];
          
          // Extract symptoms
          if (fields.symptoms && fields.symptoms.value) {
            if (Array.isArray(fields.symptoms.value)) {
              symptoms.push(...fields.symptoms.value);
            } else if (typeof fields.symptoms.value === 'string') {
              symptoms.push(fields.symptoms.value);
            }
          }
          
          // Extract medications
          if (fields.medications && fields.medications.value) {
            if (Array.isArray(fields.medications.value)) {
              medications.push(...fields.medications.value.map(m => 
                typeof m === 'object' ? m.raw || m.name || JSON.stringify(m) : m
              ));
            } else if (typeof fields.medications.value === 'string') {
              medications.push(fields.medications.value);
            }
          }
          
          // Extract instructions
          if (fields.instructions && fields.instructions.value) {
            if (Array.isArray(fields.instructions.value)) {
              instructions.push(...fields.instructions.value);
            } else if (typeof fields.instructions.value === 'string') {
              instructions.push(fields.instructions.value);
            }
          }
          
          // Extract follow-up
          let followUp = '';
          if (fields.follow_up && fields.follow_up.value) {
            followUp = fields.follow_up.value;
          }
          
          // Set the generated form with extracted data
          setGeneratedForm({
            patientInfo: { 
              name: patientInfo.name || (fields.patient_name ? fields.patient_name.value : 'Patient'), 
              age: patientInfo.age || (fields.patient_age ? fields.patient_age.value : ''), 
              gender: patientInfo.gender || (fields.patient_gender ? fields.patient_gender.value : '') 
            },
            symptoms: symptoms.length > 0 ? symptoms : prescriptionData.symptoms || [],
            diagnosis: [],
            medications: medications.length > 0 ? medications : prescriptionData.medications || [],
            investigations: investigations.length > 0 ? investigations : prescriptionData.investigations || [],
            instructions: instructions.length > 0 ? instructions : prescriptionData.instructions || [],
            followUp: followUp
          });
          
          // Use sections/entities for dynamic UI generation if available
          if (sections && Object.keys(sections).length) {
            setAutoFields(buildAutoFields(sections));
          } else if (entities && Object.keys(entities).length) {
            setAutoFields(buildAutoFields({ entities }));
          } else {
            // Fallback to fields for dynamic UI generation
            setAutoFields(buildAutoFields(fields));
          }
        } else if ((sections && Object.keys(sections).length) || (entities && Object.keys(entities).length)) {
          console.debug('[VoiceRx] Using sections/entities path');
          // If we have sections but no fields, use sections directly
          setGeneratedForm({
            patientInfo: { 
              name: patientInfo.name || (sections ? sections['Patient Name'] : '') || 'Patient', 
              age: patientInfo.age || (sections ? sections['Patient Age'] : '') || '', 
              gender: patientInfo.gender || (sections ? sections['Gender'] : '') || '' 
            },
            symptoms: sections && sections['Symptoms'] ? [sections['Symptoms']] : prescriptionData.symptoms || [],
            diagnosis: [],
            medications: sections && sections['Medication'] ? [sections['Medication']] : prescriptionData.medications || [],
            investigations: prescriptionData.investigations || [],
            instructions: sections && sections['Instructions'] ? [sections['Instructions']] : prescriptionData.instructions || [],
            followUp: (sections && sections['Follow-Up']) || ''
          });
          
          if (sections && Object.keys(sections).length) {
            setAutoFields(buildAutoFields(sections));
          } else if (entities && Object.keys(entities).length) {
            setAutoFields(buildAutoFields({ entities }));
          }
        } else {
          // Use local extraction if neither fields nor sections are available
          setGeneratedForm({
            patientInfo: { 
              name: patientInfo.name || 'Patient', 
              age: patientInfo.age || '', 
              gender: patientInfo.gender || '' 
            },
            symptoms: prescriptionData.symptoms || [],
            diagnosis: [],
            medications: prescriptionData.medications || [],
            investigations: prescriptionData.investigations || [],
            instructions: prescriptionData.instructions || [],
            followUp: ''
          });
          
          setAutoFields(buildAutoFields({
            symptoms: prescriptionData.symptoms || [],
            medications: prescriptionData.medications || [],
            investigations: prescriptionData.investigations || [],
            instructions: prescriptionData.instructions || []
          }));
        }

        // Set generated prescription
        if (prescriptionText) {
          setGeneratedPrescription(prescriptionText);
        } else {
          generatePrescription();
        }
      } else {
        // Fallback to local processing
        console.warn('[VoiceRx] No result from backend; generating structured form locally');
        generateStructuredForm();
      }
    } catch (error) {
      // Backend processing failed
      // Fallback to local processing
      console.error('[VoiceRx] Backend processing failed:', error);
      generateStructuredForm();
    } finally {
      console.debug('[VoiceRx] autoFields length:', (autoFields || []).length);
      // If backend didn't yield structure, try server-side parse-text first (uses same parser as ASR path)
      try {
        if ((!autoFields || autoFields.length === 0) && (transcript && transcript.trim())) {
          try {
            const textResp = await voiceService.parseText(transcript, {
              storeResult: false,
              patientId: patientId || null,
              doctorId: doctorId || null
            });
            if (textResp?.result) {
              const { sections, fields } = textResp.result;
              // Build generated form similarly to fields path
              const symptoms = [];
              const medications = [];
              const investigations = [];
              const instructions = [];
              if (fields?.symptoms?.value) {
                if (Array.isArray(fields.symptoms.value)) symptoms.push(...fields.symptoms.value);
                else if (typeof fields.symptoms.value === 'string') symptoms.push(fields.symptoms.value);
              }
              if (fields?.medications?.value) {
                if (Array.isArray(fields.medications.value)) {
                  medications.push(...fields.medications.value.map(m => typeof m === 'object' ? (m.raw || m.name || JSON.stringify(m)) : m));
                } else if (typeof fields.medications.value === 'string') {
                  medications.push(fields.medications.value);
                }
              }
              if (fields?.instructions?.value) {
                if (Array.isArray(fields.instructions.value)) instructions.push(...fields.instructions.value);
                else if (typeof fields.instructions.value === 'string') instructions.push(fields.instructions.value);
              }
              const followUp = fields?.follow_up?.value || '';
              setGeneratedForm(prev => ({
                patientInfo: {
                  name: patientInfo.name || (fields?.patient_name ? fields.patient_name.value : 'Patient'),
                  age: patientInfo.age || (fields?.patient_age ? fields.patient_age.value : ''),
                  gender: patientInfo.gender || (fields?.patient_gender ? fields.patient_gender.value : '')
                },
                symptoms: symptoms.length > 0 ? symptoms : (prev.symptoms || []),
                diagnosis: prev.diagnosis || [],
                medications: medications.length > 0 ? medications : (prev.medications || []),
                investigations: investigations.length > 0 ? investigations : (prev.investigations || []),
                instructions: instructions.length > 0 ? instructions : (prev.instructions || []),
                followUp
              }));
              if (sections && Object.keys(sections).length) setAutoFields(buildAutoFields(sections));
              else if (fields) setAutoFields(buildAutoFields(fields));
              console.debug('[VoiceRx] Populated fields via /parse-text');
            }
          } catch (e) {
            console.warn('[VoiceRx] /parse-text failed, falling back to local regex:', e);
          }
        }
      } catch {}

      // If still empty, do local regex-based transcript fallback
      try {
        if ((!autoFields || autoFields.length === 0) && (transcript && transcript.trim())) {
          const derived = buildFieldsFromTranscript(transcript);
          if (derived.fields.length) {
            setAutoFields(derived.fields);
            setGeneratedForm(prev => ({
              ...prev,
              symptoms: prev.symptoms && prev.symptoms.length ? prev.symptoms : derived.parts.symptoms || [],
              medications: prev.medications && prev.medications.length ? prev.medications : derived.parts.medications || [],
              instructions: prev.instructions && prev.instructions.length ? prev.instructions : derived.parts.instructions || []
            }));
            console.debug('[VoiceRx] Populated fields from transcript fallback');
          }
        }
      } catch (e) {
        console.warn('[VoiceRx] Transcript fallback failed:', e);
      }
      setCurrentStep('generated');
    }
  };

  // Generate structured form locally
  const generateStructuredForm = () => {
    setGeneratedForm({
      patientInfo: { 
        name: patientInfo.name || 'Patient', 
        age: patientInfo.age || '', 
        gender: patientInfo.gender || '' 
      },
      symptoms: prescriptionData.symptoms || [],
      diagnosis: [],
      medications: prescriptionData.medications || [],
      investigations: prescriptionData.investigations || [],
      instructions: prescriptionData.instructions || [],
      followUp: ''
    });
    setAutoFields(buildAutoFields({
      patient_name: patientInfo.name || 'Patient',
      symptoms: prescriptionData.symptoms || [],
      medications: prescriptionData.medications || [],
      investigations: prescriptionData.investigations || [],
      instructions: prescriptionData.instructions || []
    }));
    generatePrescription();
    setCurrentStep('generated');
  };

  // Generate prescription
  const generatePrescription = () => {
    const prescription = `
MEDICAL PRESCRIPTION
${'='.repeat(60)}

PATIENT DETAILS:
Name: ${patientInfo.name}
Age: ${patientInfo.age || 'Not specified'}
Gender: ${patientInfo.gender || 'Not specified'}
Date: ${new Date().toLocaleDateString()}

PRESENTING COMPLAINTS:
${prescriptionData.symptoms.length > 0 
  ? prescriptionData.symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')
  : '• No specific symptoms recorded'}

PRESCRIBED MEDICATIONS:
${prescriptionData.medications.length > 0
  ? prescriptionData.medications.map((m, i) => `${i + 1}. ${m}`).join('\n')
  : '• No medications prescribed'}

INVESTIGATIONS RECOMMENDED:
${prescriptionData.investigations.length > 0
  ? prescriptionData.investigations.map((inv, i) => `${i + 1}. ${inv}`).join('\n')
  : '• No investigations ordered'}

CLINICAL INSTRUCTIONS:
${prescriptionData.instructions.length > 0
  ? prescriptionData.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')
  : '• Follow standard medical care guidelines\n• Take adequate rest\n• Maintain proper hydration'}

PHYSICIAN DETAILS:
Dr. ${doctorInfo.name}
Specialty: ${doctorInfo.specialty}
Registration: ${doctorInfo.registration}

${'='.repeat(60)}
Generated by Voice Rx AI System
    `.trim();

    setGeneratedPrescription(prescription);
  };

  // Reset modal
  const resetModal = () => {
    setCurrentStep('start');
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setIsEditMode(false);
    setTranscript('');
    setAudioBlob(null);
    setPrescriptionData({
      symptoms: [],
      medications: [],
      investigations: [],
      instructions: []
    });
    setGeneratedPrescription('');
    setWaveformBars(Array(20).fill(0));
    setAutoFields([]);
  };

  // Handle modal close
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Apply generated form to consultation
  const handleApplyToConsultation = () => {
    if (onApply) {
      // Prefer dynamically generated autoFields if present
      let sectionsPayload = {};
      if (autoFields && autoFields.length > 0) {
        sectionsPayload = autoFields.reduce((acc, f) => {
          const label = f.label || f.key;
          if (f.type === 'list') {
            acc[label] = (f.values || []).filter(Boolean).join(', ');
          } else {
            acc[label] = (f.values && f.values[0]) ? f.values[0] : '';
          }
          return acc;
        }, {});
      } else {
        sectionsPayload = {
          'Symptoms': generatedForm.symptoms.join(', '),
          'Medication': generatedForm.medications.join(', '),
          'Instructions': generatedForm.instructions.join(', '),
          'Diagnosis': generatedForm.diagnosis.join(', '),
          'Follow-Up': generatedForm.followUp
        };
      }

      onApply({
        transcript,
        sections: sectionsPayload,
        realTime: false
      });
    }
    handleClose();
  };

  // Save generated form (could save to database)
  const handleSaveForm = () => {
    // Save generated form functionality
    // TODO: Implement save to database
    alert('Form saved successfully!');
  };

  // Update generated form field
  const updateFormField = (category, index, value) => {
    setGeneratedForm(prev => {
      const updated = { ...prev };
      if (Array.isArray(updated[category])) {
        updated[category][index] = value;
      } else {
        updated[category] = value;
      }
      return updated;
    });
  };

  // Update auto field helpers
  const updateAutoFieldValue = (fieldIndex, valueIndex, value) => {
    setAutoFields(prev => {
      const next = [...prev];
      const f = { ...next[fieldIndex] };
      const vals = [...f.values];
      vals[valueIndex] = value;
      f.values = vals;
      next[fieldIndex] = f;
      return next;
    });
  };

  const addAutoFieldItem = (fieldIndex) => {
    setAutoFields(prev => {
      const next = [...prev];
      const f = { ...next[fieldIndex] };
      f.values = [...f.values, ''];
      next[fieldIndex] = f;
      return next;
    });
  };

  const removeAutoFieldItem = (fieldIndex, valueIndex) => {
    setAutoFields(prev => {
      const next = [...prev];
      const f = { ...next[fieldIndex] };
      f.values = f.values.filter((_, i) => i !== valueIndex);
      next[fieldIndex] = f;
      return next;
    });
  };

  // Add new field to category
  const addFormField = (category) => {
    setGeneratedForm(prev => ({
      ...prev,
      [category]: [...prev[category], '']
    }));
  };

  // Remove field from category
  const removeFormField = (category, index) => {
    setGeneratedForm(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  // Render start screen
  const renderStartScreen = () => (
    <div className="text-center space-y-6 py-8">
      {/* Branding logo */}
      <div className="flex justify-center mb-4">
        <img 
          src="/saaro-health2.png" 
          alt="Saaro Health Logo" 
          className="h-16 w-auto"
        />
      </div>
      
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#7047d1] to-[#5a3bb8] rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5 1 1 0 000 2zM10 3a1 1 0 00-1 1v4a1 1 0 002 0V4a1 1 0 00-1-1z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M16 12a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1h10a1 1 0 011 1v2zm-1 0v2H5v-2h10z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Start your consultation with the patient</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Dictate the complete prescription effortlessly
        </p>
      </div>

      {/* Tips carousel */}
      <div className="bg-purple-50 rounded-lg p-4 max-w-lg mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15 7a1 1 0 100-2h-1a1 1 0 100 2h1zM5 7a1 1 0 100-2H4a1 1 0 100 2h1zM15.657 12.556l-.855-.855A1.5 1.5 0 0014 11.5H4a1.5 1.5 0 00-.857.257l-.855.855a1 1 0 101.414 1.414l.855-.855A.5.5 0 014 12.5h10a.5.5 0 01.414.257l.855.855a1 1 0 001.414-1.414z" />
              <path fillRule="evenodd" d="M4 10a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4zm12-4H4V4h12v2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-purple-800">{tips[currentTipIndex].title}</h3>
            <p className="text-sm text-purple-600">{tips[currentTipIndex].content}</p>
          </div>
        </div>
        
        {/* Carousel indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTipIndex(index)}
              className={`w-3 h-3 rounded-full ${index === currentTipIndex ? 'bg-purple-600' : 'bg-purple-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#7047d1] to-[#5a3bb8] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={startRecording}>
          <FaMicrophone className="text-white text-2xl" />
        </div>
        <p className="text-gray-500 text-sm">Tap to Speak</p>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Or type here instead"
          className="w-full max-w-md mx-auto border border-gray-300 rounded-lg px-4 py-3 text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              setTranscript(e.target.value);
              processWithBackendService();
            }
          }}
        />
      </div>
    </div>
  );

  // Render recording screen with split layout
  const renderRecordingScreen = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
      {/* Left side - Voice Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5 1 1 0 000 2zM10 3a1 1 0 00-1 1v4a1 1 0 002 0V4a1 1 0 00-1-1z" clipRule="evenodd" />
  <path fillRule="evenodd" d="M16 12a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1h10a1 1 0 011 1v2zm-1 0v2H5v-2h10z" clipRule="evenodd" />
</svg>
          </div>
          <h3 className="font-semibold text-gray-800">Your Input</h3>
        </div>
        
        {/* Recording status */}
        <div className="text-center py-4">
          <div className="text-2xl font-mono text-[#7047d1] mb-2">{formatTime(recordingTime)}</div>
          
          {/* Waveform visualization */}
          <div className="flex items-center justify-center space-x-1 h-12 mb-4">
            {waveformBars.map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-[#7047d1] to-[#a78bfa] rounded-full transition-all duration-100"
                style={{
                  width: '3px',
                  height: `${Math.max(4, height * 0.4)}px`,
                }}
              ></div>
            ))}
          </div>
          
          <p className="text-gray-500 text-sm mb-4">Listening...</p>
          
          {/* Control buttons */}
          <div className="flex justify-center space-x-3">
            <button className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            </button>
            <button 
              onClick={stopRecording}
              className="w-12 h-12 bg-[#7047d1] rounded-full flex items-center justify-center text-white hover:bg-[#5a3bb8] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            </button>
          </div>
        </div>
        
        {/* Recording tips */}
        <div className="bg-gray-50 rounded-lg p-3 h-32 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <img src="/ai.png" alt="AI Assistant" className="h-8 w-8" />
            </div>
            <p className="text-sm text-gray-600">AI is listening and analyzing...</p>
            <p className="text-xs text-gray-500 mt-1">Speak naturally about the patient's condition</p>
          </div>
        </div>
      </div>

      {/* Right side - AI Analysis Status */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">AI Analysis</h3>
        </div>
        
        {/* AI Status */}
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#7047d1] border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-purple-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium text-gray-800 mb-2">Processing Voice Input</h4>
            <p className="text-sm text-gray-600 mb-4">AI is analyzing your speech for medical entities...</p>
            
            {/* Processing steps */}
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Audio capture active</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-[#7047d1] rounded-full animate-pulse"></div>
                <span>Speech recognition in progress</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Medical entity extraction pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render processing screen
  const renderProcessingScreen = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
      {/* Left side - Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5 1 1 0 000 2zM10 3a1 1 0 00-1 1v4a1 1 0 002 0V4a1 1 0 00-1-1z" clipRule="evenodd" />
  <path fillRule="evenodd" d="M16 12a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1h10a1 1 0 011 1v2zm-1 0v2H5v-2h10z" clipRule="evenodd" />
</svg>
          </div>
          <h3 className="font-semibold text-gray-800">Your Input</h3>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 h-64">
          <div className="space-y-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Processing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm10-2H8V6h8v2z" clipRule="evenodd" />
</svg>
          </div>
          <h3 className="font-semibold text-gray-800">Generated Digitised Rx</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#7047d1] border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-purple-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-2">Finalizing your structured prescription...</p>
            
            {/* Progress bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render generated form screen
  const renderGeneratedFormScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">AI Generated Prescription Form</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setCurrentStep('results')} variant="outline" size="sm">
            <FiDownload className="mr-1" />
            View Prescription
          </Button>
        </div>
      </div>

      {/* Always render dynamic fields; derive from generatedForm if autoFields is empty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
        {(autoFields && autoFields.length > 0 ? autoFields : deriveFieldsFromGeneratedForm(generatedForm)).map((field, fIdx) => (
          <div key={field.key + fIdx} className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-[#7047d1] rounded-full mr-2"></span>
              {field.label}
            </h4>
            <div className="space-y-2">
              {field.type === 'list' && field.values.map((v, vIdx) => (
                <div key={vIdx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={v}
                    onChange={(e) => updateAutoFieldValue(fIdx, vIdx, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                  <button
                    onClick={() => removeAutoFieldItem(fIdx, vIdx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              {field.type === 'text' && (
                <input
                  type="text"
                  value={field.values[0] || ''}
                  onChange={(e) => updateAutoFieldValue(fIdx, 0, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              )}
              {field.type === 'textarea' && (
                <textarea
                  value={field.values[0] || ''}
                  onChange={(e) => updateAutoFieldValue(fIdx, 0, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              )}
              {field.type === 'list' && (
                <button
                  onClick={() => addAutoFieldItem(fIdx)}
                  className="text-[#7047d1] hover:text-[#5a3bb8] text-sm"
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button onClick={() => setCurrentStep('start')} variant="outline">
          New Recording
        </Button>
        <div className="space-x-3">
          <Button onClick={handleSaveForm} variant="secondary">
            <FiSave className="mr-1" />
            Save Form
          </Button>
          <Button onClick={handleApplyToConsultation} variant="success">
            Apply to Consultation
          </Button>
        </div>
      </div>
    </div>
  );

  // Render results screen
  const renderResultsScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Generated Prescription</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant="outline"
            size="sm"
          >
            <FiEdit3 className="mr-1" />
            {isEditMode ? 'View' : 'Edit'}
          </Button>
          <Button variant="outline" size="sm">
            <FiPrinter className="mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <FiDownload className="mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
        {isEditMode ? (
          <textarea
            value={generatedPrescription}
            onChange={(e) => setGeneratedPrescription(e.target.value)}
            className="w-full h-80 border-none resize-none focus:outline-none font-mono text-sm"
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {generatedPrescription}
          </pre>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={resetModal} variant="outline">
          New Session
        </Button>
        <div className="space-x-3">
          <Button onClick={handleClose} variant="success">
            End Visit
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Voice Rx AI System"
      size="xl"
      className="voice-rx-modal"
    >
      <div className="min-h-[500px]">
        {currentStep === 'start' && renderStartScreen()}
        {currentStep === 'recording' && renderRecordingScreen()}
        {currentStep === 'processing' && renderProcessingScreen()}
        {currentStep === 'generated' && renderGeneratedFormScreen()}
        {currentStep === 'results' && renderResultsScreen()}
      </div>
    </Modal>
  );
}
export default EnhancedVoiceRxModal;
