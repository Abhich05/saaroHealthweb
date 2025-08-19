import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/SideBar';
import Header from '../components/layout/Header';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiSettings, FiPlus, FiSave, FiFile, FiThermometer, FiMic } from 'react-icons/fi';
import { FaMicrophone, FaHeartbeat, FaBaby } from "react-icons/fa";
import { MdOutlineMonitorHeart } from 'react-icons/md';
import PastVisitsSection from '../components/consultation/PastVisitsSection';
import { MdDeleteOutline } from 'react-icons/md';
import DraggableSection from '../components/consultation/DraggableSection';
import VitalsGrid from '../components/consultation/VitalsGrid';
import Modal from '../components/ui/Modal';
import Button from "../components/ui/Button";
import PatientAvatar from '../components/ui/PatientAvatar';
import PatientDetailsCard from '../components/ui/PatientDetailsCard';
import TemplateModal from '../components/ui/TemplateModal';
import AddSectionModal from '../components/ui/AddSectionModal';
import PrescriptionPreviewModal from '../components/ui/PrescriptionPreviewModal';
import VoiceRxModal from '../components/ui/VoiceRxModal';
import { printPrescription } from '../utils/printPrescription';
import {
  ComplaintsSection,
  HistorySection,
  ExaminationSection,
  DiagnosisSection,
  InvestigationsSection,
  MedicationSection,
  AdviceSection,
  FollowUpSection
} from '../components/consultation/Sections';
import { rxData } from '../data/RxDummyData';
import { SortableItem } from '../components/consultation/SortableItem';
import axiosInstance from '../api/axiosInstance';
import ConsultSkeletonLoader from '../components/ui/ConsultSkeletonLoader';
import { toast } from 'react-toastify';
import { DoctorIdContext } from '../App';
import { getDoctorToken } from '../utils/auth';

const DEFAULT_SECTION_ORDER = [
  'complaints',
  'history',
  'examination',
  'diagnosis',
  'investigations',
  'medication',
  'advice',
  'followUp'
];

const STORAGE_KEY = 'consult-section-order';

// Inbuilt Templates
const INBUILT_TEMPLATES = {
  general: {
    name: "General Consultation",
    description: "Standard consultation template for general health issues",
    formData: {
      vitals: {
        bp: '',
        pulse: '',
        height: '',
        weight: '',
        temperature: '',
        spo2: '',
        rbs: ''
      },
      complaints: [{ id: crypto.randomUUID(), text: '' }],
      medication: [{
        id: crypto.randomUUID(),
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      }],
      pastHistory: [{ id: crypto.randomUUID(), value: '' }],
      surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
      drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
      physicalExamination: [{ id: crypto.randomUUID(), text: '' }],
      diagnosis: {
        provisional: [{ id: crypto.randomUUID(), value: '' }],
        final: [{ id: crypto.randomUUID(), value: '' }]
      },
      tests: [{ id: crypto.randomUUID(), value: '' }],
      testNotes: [{ id: crypto.randomUUID(), value: '' }],
      advice: '',
      followUp: ['', '']
    }
  },
  fever: {
    name: "Fever & Infection",
    description: "Template for fever, cold, and infection cases",
    formData: {
      vitals: {
        bp: '',
        pulse: '',
        height: '',
        weight: '',
        temperature: '',
        spo2: '',
        rbs: ''
      },
      complaints: [
        { id: crypto.randomUUID(), text: 'Fever' },
        { id: crypto.randomUUID(), text: 'Body ache' },
        { id: crypto.randomUUID(), text: 'Headache' },
        { id: crypto.randomUUID(), text: 'Cough' },
        { id: crypto.randomUUID(), text: 'Sore throat' }
      ],
      medication: [{
        id: crypto.randomUUID(),
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'TDS',
        duration: '3 days',
        notes: 'For fever and pain'
      }],
      pastHistory: [{ id: crypto.randomUUID(), value: '' }],
      surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
      drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
      physicalExamination: [
        { id: crypto.randomUUID(), text: 'Temperature' },
        { id: crypto.randomUUID(), text: 'Throat examination' },
        { id: crypto.randomUUID(), text: 'Lymph nodes' }
      ],
      diagnosis: {
        provisional: [{ id: crypto.randomUUID(), value: 'Viral fever' }],
        final: [{ id: crypto.randomUUID(), value: '' }]
      },
      tests: [
        { id: crypto.randomUUID(), value: 'CBC' },
        { id: crypto.randomUUID(), value: 'CRP' }
      ],
      testNotes: [{ id: crypto.randomUUID(), value: '' }],
      advice: 'Rest, plenty of fluids, monitor temperature',
      followUp: ['3 days', 'If fever persists']
    }
  },
  diabetes: {
    name: "Diabetes Management",
    description: "Template for diabetes follow-up and management",
    formData: {
      vitals: {
        bp: '',
        pulse: '',
        height: '',
        weight: '',
        temperature: '',
        spo2: '',
        rbs: ''
      },
      complaints: [
        { id: crypto.randomUUID(), text: 'Blood sugar control' },
        { id: crypto.randomUUID(), text: 'Medication compliance' }
      ],
      medication: [{
        id: crypto.randomUUID(),
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'BD',
        duration: 'Continue',
        notes: 'With meals'
      }],
      pastHistory: [{ id: crypto.randomUUID(), value: 'Diabetes mellitus' }],
      surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
      drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
      physicalExamination: [
        { id: crypto.randomUUID(), text: 'Blood pressure' },
        { id: crypto.randomUUID(), text: 'Foot examination' },
        { id: crypto.randomUUID(), text: 'Weight' }
      ],
      diagnosis: {
        provisional: [{ id: crypto.randomUUID(), value: 'Type 2 Diabetes Mellitus' }],
        final: [{ id: crypto.randomUUID(), value: '' }]
      },
      tests: [
        { id: crypto.randomUUID(), value: 'FBS' },
        { id: crypto.randomUUID(), value: 'PPBS' },
        { id: crypto.randomUUID(), value: 'HbA1c' },
        { id: crypto.randomUUID(), value: 'Kidney function' }
      ],
      testNotes: [{ id: crypto.randomUUID(), value: '' }],
      advice: 'Regular exercise, diet control, foot care, regular monitoring',
      followUp: ['1 month', 'For HbA1c and medication adjustment']
    }
  },
  hypertension: {
    name: "Hypertension",
    description: "Template for blood pressure management",
    formData: {
      vitals: {
        bp: '',
        pulse: '',
        height: '',
        weight: '',
        temperature: '',
        spo2: '',
        rbs: ''
      },
      complaints: [
        { id: crypto.randomUUID(), text: 'Blood pressure monitoring' },
        { id: crypto.randomUUID(), text: 'Headache' },
        { id: crypto.randomUUID(), text: 'Dizziness' }
      ],
      medication: [{
        id: crypto.randomUUID(),
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'OD',
        duration: 'Continue',
        notes: 'Morning dose'
      }],
      pastHistory: [{ id: crypto.randomUUID(), value: 'Hypertension' }],
      surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
      drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
      physicalExamination: [
        { id: crypto.randomUUID(), text: 'Blood pressure' },
        { id: crypto.randomUUID(), text: 'Cardiovascular system' },
        { id: crypto.randomUUID(), text: 'Fundus examination' }
      ],
      diagnosis: {
        provisional: [{ id: crypto.randomUUID(), value: 'Essential Hypertension' }],
        final: [{ id: crypto.randomUUID(), value: '' }]
      },
      tests: [
        { id: crypto.randomUUID(), value: 'ECG' },
        { id: crypto.randomUUID(), value: 'Echo' },
        { id: crypto.randomUUID(), value: 'Kidney function' }
      ],
      testNotes: [{ id: crypto.randomUUID(), value: '' }],
      advice: 'Low salt diet, regular exercise, stress management, regular BP monitoring',
      followUp: ['2 weeks', 'For BP control assessment']
    }
  },
  pediatrics: {
    name: "Pediatrics",
    description: "Template for pediatric consultations",
    formData: {
      vitals: {
        bp: '',
        pulse: '',
        height: '',
        weight: '',
        temperature: '',
        spo2: '',
        rbs: ''
      },
      complaints: [
        { id: crypto.randomUUID(), text: 'Fever' },
        { id: crypto.randomUUID(), text: 'Cough' },
        { id: crypto.randomUUID(), text: 'Poor appetite' }
      ],
      medication: [{
        id: crypto.randomUUID(),
        name: 'Syrup Paracetamol',
        dosage: '10-15mg/kg',
        frequency: 'QID',
        duration: '3 days',
        notes: 'For fever'
      }],
      pastHistory: [{ id: crypto.randomUUID(), value: '' }],
      surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
      drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
      physicalExamination: [
        { id: crypto.randomUUID(), text: 'Growth parameters' },
        { id: crypto.randomUUID(), text: 'Throat examination' },
        { id: crypto.randomUUID(), text: 'Chest auscultation' }
      ],
      diagnosis: {
        provisional: [{ id: crypto.randomUUID(), value: 'Upper respiratory tract infection' }],
        final: [{ id: crypto.randomUUID(), value: '' }]
      },
      tests: [
        { id: crypto.randomUUID(), value: 'CBC' },
        { id: crypto.randomUUID(), value: 'Chest X-ray if needed' }
      ],
      testNotes: [{ id: crypto.randomUUID(), value: '' }],
      advice: 'Adequate hydration, rest, monitor temperature, return if symptoms worsen',
      followUp: ['3 days', 'If symptoms persist']
    }
  }
};

const ConsultationForm = () => {
  const { id } = useParams();
  const doctorId = useContext(DoctorIdContext);
  // const patient = rxData.find((p) => p.uid === id);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/patient/uid/${id}`)
      .then(res => {
        setPatient(res.data.patient);
      })
      .catch(() => {
        setPatient(null);
        setError("Failed to fetch patient data.");
      })
      .finally(() => setLoading(false));
  }, [id]);


  const [isConfigMode, setIsConfigMode] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Error parsing saved order:", e);
      }
    }
    return DEFAULT_SECTION_ORDER;
  });

  const [customSections, setCustomSections] = useState(() => {
    const saved = localStorage.getItem('customSections');
    return saved ? JSON.parse(saved) : [];
  });

  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [showVoiceRx, setShowVoiceRx] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('complaints');
  const [transcript, setTranscript] = useState('');
  const [showCustomTemplateForm, setShowCustomTemplateForm] = useState(false);
  const [showPrescriptionPreview, setShowPrescriptionPreview] = useState(false);
  const [newSectionData, setNewSectionData] = useState({ heading: '', label: '', type: '', options: '' });
  const [customTemplateData, setCustomTemplateData] = useState({ name: '', description: '' });
  const [activeId, setActiveId] = useState(null);
  // Draft persistence key util
  const draftKeyFor = (patientId) => `consult-draft:${doctorId || 'anon'}:${patientId || id}`;

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    const savedCustomSections = localStorage.getItem('customSections');
    try {
      let custom = [];
      let order = [];

      if (savedCustomSections) {
        custom = JSON.parse(savedCustomSections);
      }

      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          order = parsedOrder;
        }
      }

      if (!savedOrder) {
        order = [...DEFAULT_SECTION_ORDER];
      }

      const customIds = custom.map(section => section.id);
      customIds.forEach(id => {
        if (!order.includes(id)) {
          order.push(id);
        }
      });

      setCustomSections(custom);
      setSectionOrder(order);
    } catch (err) {
      console.error("Error parsing local storage data:", err);
      setCustomSections([]);
      setSectionOrder([...DEFAULT_SECTION_ORDER]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customSections', JSON.stringify(customSections));
  }, [customSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  const updateSectionOrder = (newOrder) => {
    setSectionOrder(newOrder);
  };

  const handleAddCustomSection = (sectionData) => {
    const { heading, label, type, options, required } = sectionData;
    if (!heading.trim() || !label.trim() || !type.trim()) return;
    const newId = crypto.randomUUID();
    const newSection = {
      id: newId,
      heading,
      fields: [{
        label,
        type,
        required,
        options: type === 'dropdown' ? options.split(',').map(opt => opt.trim()) : [],
        values: [{ id: crypto.randomUUID(), value: '' }]
      }]
    };
    setCustomSections([...customSections, newSection]);
    setSectionOrder([newId, ...sectionOrder]);
  };

  const handleDeleteCustomSection = (id) => {
    setCustomSections(customSections.filter((s) => s.id !== id));
    setSectionOrder(sectionOrder.filter((secId) => secId !== id));
  };

  const handleLoadTemplate = (templateKey) => {
    const template = INBUILT_TEMPLATES[templateKey];
    if (template) {
      setFormData(template.formData);
      setShowTemplateModal(false);
      toast.success(`Loaded template: ${template.name}`);
    }
  };

  const handleSaveCustomTemplate = async () => {
    if (!customTemplateData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!doctorId) {
      toast.error('Doctor ID not found');
      return;
    }

    try {
      const templatePayload = {
        name: customTemplateData.name,
        description: customTemplateData.description,
        doctorId: doctorId,
        formData: formData,
        customSections: customSections,
        sectionOrder: sectionOrder,
        isCustom: true
      };

      const response = await axiosInstance.post(`/${doctorId}/template`, templatePayload);
      
      if (response.data.template) {
        toast.success('Custom template saved successfully!');
        setCustomTemplateData({ name: '', description: '' });
        setShowCustomTemplateForm(false);
        setShowTemplateModal(false);
      } else {
        toast.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving custom template:', error);
      toast.error(error?.response?.data?.error || 'Failed to save custom template');
    }
  };

  // --- Speech recognition helpers ---
  const startRecognition = () => {
    setMicError('');
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Speech Recognition API is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecording(true);
      recognition.onerror = (e) => {
        console.error('Speech recognition error', e);
        setMicError(e.error || 'Microphone error');
        setIsRecording(false);
        recognition.stop?.();
      };

      recognition.onresult = (event) => {
        const text = (event.results[0] && event.results[0][0].transcript) || '';
        setTranscript(text);
        // populate the selected field with the recognized text
        applyTranscriptToTarget(text);
      };

      recognition.onend = () => setIsRecording(false);

      // store on window so stop can access it
      window.__mysaaro_recognition = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setMicError('Failed to start speech recognition');
    }
  };

  const stopRecognition = () => {
    try {
      const recognition = window.__mysaaro_recognition;
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
        delete window.__mysaaro_recognition;
      }
    } catch (err) {
      console.error('Error stopping recognition', err);
    }
    setIsRecording(false);
  };

  const applyTranscriptToTarget = (text) => {
    if (!text) return;

    // quick vitals auto-detection
    const parseVitalsFromText = (input = '') => {
      const t = (input || '').toLowerCase();
      const out = {};
      const bpMatch = t.match(/(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})/);
      if (bpMatch) out.bp = `${bpMatch[1]}/${bpMatch[2]}`;
      const pulseMatch = t.match(/(?:pulse|hr|heart rate)\s*(?:is|:)?\s*(\d{2,3})/);
      if (pulseMatch) out.pulse = pulseMatch[1];
      const spo2Match = t.match(/(?:spo2|spo|oxygen(?: saturation)?)\s*(?:is|:)?\s*(\d{2,3})/);
      if (spo2Match) out.spo2 = spo2Match[1];
      const rbsMatch = t.match(/(?:rbs|blood sugar|sugar)\s*(?:is|:)?\s*(\d{2,3})/);
      if (rbsMatch) out.rbs = rbsMatch[1];
      const tempMatch = t.match(/(?:temp(?:erature)?|fever)\s*(?:is|:)?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:°?\s?(f|c))?/);
      if (tempMatch) {
        const val = tempMatch[1];
        const unit = tempMatch[2] || 'f';
        out.temperature = unit === 'c' ? `${val} °C` : `${val} °F`;
      } else {
        const tempShort = t.match(/([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:°\s*)?(f|c)\b/);
        if (tempShort) out.temperature = `${tempShort[1]} ${tempShort[2].toUpperCase()}`;
      }
      const heightMatch = t.match(/(?:height)\s*(?:is|:)?\s*(\d{2,3})\s*(?:cm|centimeters)?/);
      if (heightMatch) out.height = heightMatch[1];
      const weightMatch = t.match(/(?:weight)\s*(?:is|:)?\s*(\d{1,3}(?:\.[0-9]+)?)\s*(?:kg|kilograms)?/);
      if (weightMatch) out.weight = weightMatch[1];
      return out;
    };

    const vitalsDetected = parseVitalsFromText(text);
    console.debug('Voice: vitalsDetected=', vitalsDetected, 'selectedTarget=', selectedTarget);
    if (Object.keys(vitalsDetected).length > 0) {
      console.debug('Applying detected vitals to formData.vitals', vitalsDetected);
      setFormData(prev => ({ ...prev, vitals: { ...prev.vitals, ...vitalsDetected } }));
      return;
    }

    setFormData(prev => {
      const next = { ...prev };
      switch (selectedTarget) {
        case 'vital_bp':
          next.vitals = { ...next.vitals, bp: text };
          break;
        case 'vital_pulse':
          next.vitals = { ...next.vitals, pulse: text };
          break;
        case 'vital_height':
          next.vitals = { ...next.vitals, height: text };
          break;
        case 'vital_weight':
          next.vitals = { ...next.vitals, weight: text };
          break;
        case 'vital_temperature':
          next.vitals = { ...next.vitals, temperature: text };
          break;
        case 'vital_spo2':
          next.vitals = { ...next.vitals, spo2: text };
          break;
        case 'vital_rbs':
          next.vitals = { ...next.vitals, rbs: text };
          break;
        case 'complaints': {
          const idx = next.complaints.findIndex(c => !c.text?.trim());
          if (idx === -1) next.complaints.push({ id: crypto.randomUUID(), text });
          else next.complaints[idx].text = text;
          break;
        }
        case 'pastHistory':
        case 'history': {
          const idx = next.pastHistory.findIndex(h => !h.value?.trim());
          if (idx === -1) next.pastHistory.push({ id: crypto.randomUUID(), value: text });
          else next.pastHistory[idx].value = text;
          break;
        }
        case 'surgicalHistory': {
          const idx = next.surgicalHistory.findIndex(h => !h.value?.trim());
          if (idx === -1) next.surgicalHistory.push({ id: crypto.randomUUID(), value: text });
          else next.surgicalHistory[idx].value = text;
          break;
        }
        case 'drugAllergy': {
          const idx = next.drugAllergy.findIndex(h => !h.value?.trim());
          if (idx === -1) next.drugAllergy.push({ id: crypto.randomUUID(), value: text });
          else next.drugAllergy[idx].value = text;
          break;
        }
        case 'examination': {
          const idx = next.physicalExamination.findIndex(h => !h.text?.trim());
          if (idx === -1) next.physicalExamination.push({ id: crypto.randomUUID(), text });
          else next.physicalExamination[idx].text = text;
          break;
        }
        case 'diagnosis_provisional': {
          const idx = next.diagnosis.provisional.findIndex(d => !d.value?.trim());
          if (idx === -1) next.diagnosis.provisional.push({ id: crypto.randomUUID(), value: text });
          else next.diagnosis.provisional[idx].value = text;
          break;
        }
        case 'diagnosis_final': {
          const idx = next.diagnosis.final.findIndex(d => !d.value?.trim());
          if (idx === -1) next.diagnosis.final.push({ id: crypto.randomUUID(), value: text });
          else next.diagnosis.final[idx].value = text;
          break;
        }
        case 'tests': {
          const idx = next.tests.findIndex(t => !t.value?.trim());
          if (idx === -1) next.tests.push({ id: crypto.randomUUID(), value: text });
          else next.tests[idx].value = text;
          break;
        }
        case 'testNotes': {
          const idx = next.testNotes.findIndex(t => !t.value?.trim());
          if (idx === -1) next.testNotes.push({ id: crypto.randomUUID(), value: text });
          else next.testNotes[idx].value = text;
          break;
        }
        case 'med_name': {
          if (!next.medication || next.medication.length === 0) next.medication = [{ id: crypto.randomUUID(), name: text, dosage: '', frequency: '', duration: '', notes: '' }];
          else next.medication[0].name = text;
          break;
        }
        case 'med_dosage': {
          if (!next.medication || next.medication.length === 0) next.medication = [{ id: crypto.randomUUID(), name: '', dosage: text, frequency: '', duration: '', notes: '' }];
          else next.medication[0].dosage = text;
          break;
        }
        case 'med_frequency': {
          if (!next.medication || next.medication.length === 0) next.medication = [{ id: crypto.randomUUID(), name: '', dosage: '', frequency: text, duration: '', notes: '' }];
          else next.medication[0].frequency = text;
          break;
        }
        case 'med_duration': {
          if (!next.medication || next.medication.length === 0) next.medication = [{ id: crypto.randomUUID(), name: '', dosage: '', frequency: '', duration: text, notes: '' }];
          else next.medication[0].duration = text;
          break;
        }
        case 'med_notes': {
          if (!next.medication || next.medication.length === 0) next.medication = [{ id: crypto.randomUUID(), name: '', dosage: '', frequency: '', duration: '', notes: text }];
          else next.medication[0].notes = text;
          break;
        }
        case 'advice':
          next.advice = (next.advice ? next.advice + ' ' : '') + text;
          break;
        case 'followUp': {
          if (!next.followUp || next.followUp.length === 0) next.followUp = [text];
          else next.followUp[0] = text;
          break;
        }
        default: {
          if (selectedTarget && selectedTarget.startsWith('custom:')) {
            const sectionId = selectedTarget.split(':')[1];
            const section = customSections.find(s => s.id === sectionId);
            if (section) {
              if (section.fields && section.fields.length > 0) {
                const field = section.fields[0];
                const values = field.values || [];
                const idx = values.findIndex(v => !v.value?.trim());
                if (idx === -1) values.push({ id: crypto.randomUUID(), value: text });
                else values[idx].value = text;
                setCustomSections(prev => prev.map(s => s.id === sectionId ? { ...section, fields: [ { ...field, values }, ...section.fields.slice(1) ] } : s));
              }
            }
          }
        }
      }
      return next;
    });
  };

 const handleInputChange = (sectionId, fieldIdx, inputIdx, newValue) => {
   setCustomSections(prev => prev.map(section => {
     if (section.id !== sectionId) return section;
     const field = section.fields[fieldIdx];
     const updatedValues = [...field.values];
     updatedValues[inputIdx].value = newValue;

     // ✅ Only for input type, allow auto-add new row
     if (field.type === 'input' && inputIdx === updatedValues.length - 1 && newValue.trim()) {
       updatedValues.push({ id: crypto.randomUUID(), value: '' });
     }

     section.fields[fieldIdx].values = updatedValues;
     return { ...section };
   }));
 };


  const handleDeleteInput = (sectionId, fieldIdx, inputId) => {
    setCustomSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      const field = section.fields[fieldIdx];
      const filtered = field.values.filter(v => v.id !== inputId);
      if (filtered.length > 0) {
        section.fields[fieldIdx].values = filtered;
      }
      return { ...section };
    }));
  };

  const [formData, setFormData] = useState({
    vitals: {
      bp: '',
      pulse: '',
      height: '',
      weight: '',
      temperature: '',
      spo2: '',
      rbs: ''
    },
    complaints: [{ id: crypto.randomUUID(), text: '' }],
    medication: [{
      id: crypto.randomUUID(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    }],
    pastHistory: [{ id: crypto.randomUUID(), value: '' }],
    surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
    drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
    physicalExamination: [{ id: crypto.randomUUID(), text: '' }],
    diagnosis: {
      provisional: [{ id: crypto.randomUUID(), value: '' }],
      final: [{ id: crypto.randomUUID(), value: '' }]
    },
    tests: [{ id: crypto.randomUUID(), value: '' }],
    testNotes: [{ id: crypto.randomUUID(), value: '' }],
    advice: '',
    followUp: ['', '']
  });

  // Load draft for this patient when patient or doctorId changes
  useEffect(() => {
    if (!patient?._id) return;
    try {
      const key = draftKeyFor(patient._id);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setFormData(prev => ({ ...prev, ...parsed.formData }));
          setCustomSections(parsed.customSections || []);
          setSectionOrder(parsed.sectionOrder || sectionOrder);
          toast.info('Loaded saved draft for this patient');
        }
      }
    } catch (e) {
      console.error('Failed to load draft', e);
    }
  }, [patient?._id, doctorId]);

  // Autosave draft on formData/customSections/sectionOrder changes
  useEffect(() => {
    if (!patient?._id) return;
    const key = draftKeyFor(patient._id);
    const payload = { formData, customSections, sectionOrder };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  }, [formData, customSections, sectionOrder, patient?._id, doctorId]);

  const sections = useMemo(() => {
    const baseSections = {
      complaints: <ComplaintsSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} enabled={!isConfigMode} />,
      history: <HistorySection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      examination: <ExaminationSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} enabled={!isConfigMode} />,
      diagnosis: <DiagnosisSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      investigations: <InvestigationsSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      medication: <MedicationSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      advice: <AdviceSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      followUp: <FollowUpSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />
    };

    const customSectionsObj = {};
    customSections.forEach(section => {
      if (!section || !section.id) return; // Skip invalid sections
      customSectionsObj[section.id] = (
        <DraggableSection id={section.id} enabled={isConfigMode}>
          <div className="rounded-lg space-y-2">
            <div className="flex justify-between items-center -mt-1">
              <h3 className="text-lg font-semibold">{section.heading}</h3>
              {isConfigMode && (
                <button onClick={() => handleDeleteCustomSection(section.id)} className="text-red-600 text-sm"><MdDeleteOutline size={20} /></button>
              )}
            </div>
            {section.fields?.map((field, fieldIdx) => {
              const values = field?.values || [];
              return (
                <DndContext
                  key={fieldIdx}
                  onDragEnd={({ active, over }) => {
                    if (isConfigMode) return;
                    if (!over) return;
                    if (active.id !== over.id) {
                      const oldIndex = values.findIndex(v => v.id === active.id);
                      const newIndex = values.findIndex(v => v.id === over.id);
                      const newOrder = arrayMove(values, oldIndex, newIndex);
                      setCustomSections(prev => prev.map(s => {
                        if (s.id !== section.id) return s;
                        s.fields[fieldIdx].values = newOrder;
                        return { ...s };
                      }));
                    }
                  }}
                >
                                    <SortableContext items={values.map(v => v?.id || '').filter(Boolean)} strategy={verticalListSortingStrategy}>
                    {values.map((val, idx) => (
                      val?.id ? (
                      <SortableItem key={val.id} id={val.id} disabled={isConfigMode}>
                        <div className="flex flex-1 items-center gap-2">
                          {field.type === "input" && (
   <input
     value={val.value}
     onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
     className="flex-1 border rounded p-2"
   />
 )}

 {field.type === "textarea" && (
   <textarea
     value={val.value}
     onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
     className="flex-1 border rounded p-2"
   />
 )}

 {field.type === "date" && (
   <input
     type="date"
     value={val.value}
     onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
     className="flex-1 border rounded p-2"
   />
 )}

 {field.type === "dropdown" && (
   <select
     value={val.value}
     onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
     className="flex-1 border rounded p-2"
   >
     <option value="">Select</option>
     {field.options.map((opt, i) => (
       <option key={i} value={opt}>{opt}</option>
     ))}
   </select>
 )}

 {field.type === "checkbox" && (
   <label className="flex items-center gap-2">
     <input
       type="checkbox"
       checked={val.value === "true"}
       onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.checked ? "true" : "false")}
       className="w-5 h-5"
     />
     <span>{field.label}</span>
   </label>
 )}


                          {values.length > 1 && !isConfigMode && (
                            <button
                              onClick={() => handleDeleteInput(section.id, fieldIdx, val.id)}
                              className="text-red-600 text-sm whitespace-nowrap"
                            >
                              <MdDeleteOutline size={20} />
                            </button>
                          )}
                        </div>
                      </SortableItem>
                    ) : null
                    ))}
                  </SortableContext>
                </DndContext>
              );
            })}
          </div>
        </DraggableSection>
      );
    });

    return { ...baseSections, ...customSectionsObj };
  }, [formData, isConfigMode, customSections]);

  if (loading) return <ConsultSkeletonLoader />;
  if (error) return <div className="flex h-screen items-center justify-center text-red-600">{error}</div>;

  const handleSaveAndFinalize = async () => {
    const jwtToken = getDoctorToken();
    console.log('DEBUG: doctorId:', doctorId, 'patient:', patient, 'jwt_token:', jwtToken ? 'Present' : 'Missing');
    if (!doctorId || !patient?._id) {
      toast.error('Doctor or patient not found. doctorId: ' + doctorId + ', patient: ' + JSON.stringify(patient));
      return;
    }
    setActionLoading(true);
    try {
      const consultationData = {
        ...formData,
        customSections,
        consultationType: 'general', // You can make this dynamic
        notes: '', // You can add a notes field
      };

      // First save as past visit
      const pastVisitResponse = await axiosInstance.post(
        `/${doctorId}/prescription/${patient._id}/save-past-visit`,
        consultationData
      );

      if (pastVisitResponse.status === 201) {
        // Then end the consultation (this will generate PDF and send WhatsApp)
        await axiosInstance.post(`/${doctorId}/prescription/${patient._id}/end-consultation`, consultationData);
        
        // Refetch patient to update past prescriptions
        const res = await axiosInstance.get(`/patient/uid/${id}`);
        setPatient(res.data.patient);
        
        toast.success('Consultation saved to past visits and finalized successfully!');
        try {
          const key = draftKeyFor(patient._id);
          localStorage.removeItem(key);
        } catch (e) { console.error('failed to clear draft', e); }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoiceRxApply = ({ transcript = '', sections = {}, svcResult = null }) => {
    try {
      setFormData(prev => {
        const next = { ...prev };
        const splitItems = (txt = '') => (txt || '')
          .split(/[\n;]|(?<=[.!?])\s+/)
          .map(s => s.trim())
          .filter(Boolean);

        // Vitals from transcript if present
        const parseVitalsFromText = (input = '') => {
          const t = (input || '').toLowerCase();
          const out = {};
          const bpMatch = t.match(/(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})/);
          if (bpMatch) out.bp = `${bpMatch[1]}/${bpMatch[2]}`;
          const pulseMatch = t.match(/(?:pulse|hr|heart rate)\s*(?:is|:)?\s*(\d{2,3})/);
          if (pulseMatch) out.pulse = pulseMatch[1];
          const spo2Match = t.match(/(?:spo2|spo|oxygen(?: saturation)?)\s*(?:is|:)?\s*(\d{2,3})/);
          if (spo2Match) out.spo2 = spo2Match[1];
          const rbsMatch = t.match(/(?:rbs|blood sugar|sugar)\s*(?:is|:)?\s*(\d{2,3})/);
          if (rbsMatch) out.rbs = rbsMatch[1];
          const tempMatch = t.match(/(?:temp(?:erature)?|fever)\s*(?:is|:)?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:°?\s?(f|c))?/);
          if (tempMatch) {
            const val = tempMatch[1];
            const unit = tempMatch[2] || 'f';
            out.temperature = unit === 'c' ? `${val} °C` : `${val} °F`;
          } else {
            const tempShort = t.match(/([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:°\s*)?(f|c)\b/);
            if (tempShort) out.temperature = `${tempShort[1]} ${tempShort[2].toUpperCase()}`;
          }
          const heightMatch = t.match(/(?:height)\s*(?:is|:)?\s*(\d{2,3})\s*(?:cm|centimeters)?/);
          if (heightMatch) out.height = heightMatch[1];
          const weightMatch = t.match(/(?:weight)\s*(?:is|:)?\s*(\d{1,3}(?:\.[0-9]+)?)\s*(?:kg|kilograms)?/);
          if (weightMatch) out.weight = weightMatch[1];
          return out;
        };

        // Apply vitals from entire transcript
        const vitalsDetected = parseVitalsFromText(transcript);
        if (Object.keys(vitalsDetected).length > 0) {
          next.vitals = { ...next.vitals, ...vitalsDetected };
        }

        // Map known sections
        if (sections['Symptoms']) {
          const items = splitItems(sections['Symptoms']);
          if (items.length) {
            next.complaints = items.map(text => ({ id: crypto.randomUUID(), text }));
          }
        }

        if (sections['Diagnosis']) {
          const items = splitItems(sections['Diagnosis']);
          if (items.length) {
            next.diagnosis = {
              ...next.diagnosis,
              provisional: items.map(value => ({ id: crypto.randomUUID(), value })),
            };
          }
        }

        if (sections['Medication']) {
          const medText = (sections['Medication'] || '').trim();
          if (medText) {
            if (!next.medication || next.medication.length === 0) {
              next.medication = [{ id: crypto.randomUUID(), name: '', dosage: '', frequency: '', duration: '', notes: medText }];
            } else {
              const existing = next.medication[0].notes || '';
              next.medication[0].notes = existing ? `${existing} ${medText}` : medText;
            }
          }
        }

        if (sections['Instructions']) {
          const t = sections['Instructions'].trim();
          if (t) next.advice = (next.advice ? next.advice + ' ' : '') + t;
        }

        if (sections['Follow-Up']) {
          const t = sections['Follow-Up'].trim();
          if (t) next.followUp = [t, ...(next.followUp?.slice(1) || [])];
        }

        if (sections['Notes']) {
          const t = sections['Notes'].trim();
          if (t) next.advice = (next.advice ? next.advice + ' ' : '') + t;
        }

        return next;
      });
      toast.success('Applied Voice Rx to the form');
      setShowVoiceRx(false);
    } catch (e) {
      console.error('VoiceRx apply error', e);
      toast.error('Failed to apply Voice Rx');
    }
  };

  const handleSendWhatsApp = async () => {
    if (!doctorId || !patient?._id) {
      toast.error('Doctor or patient not found.');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        customSections,
      };
      await axiosInstance.post(`/${doctorId}/prescription/${patient._id}/end-consultation`, payload);
      toast.success('Prescription sent via WhatsApp!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send via WhatsApp.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="max-w-6xl mx-auto space-y-6 font-sans text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <PatientAvatar patient={patient} size="sm" />
                  <h1 className="text-2xl font-semibold">Consultation for {patient?.fullName || patient?.name || 'Unknown'}</h1>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsConfigMode(!isConfigMode)} 
                    variant={isConfigMode ? "success" : "primary"}
                    className="flex items-center"
                  >
                    <FiSettings className="mr-2" />
                    {isConfigMode ? 'Done' : 'Configure'}
                  </Button>
                  
                  {isConfigMode && (
                    <Button 
                      onClick={() => setShowNewSectionForm(true)} 
                      variant="success"
                      className="flex items-center"
                    >
                      <FiPlus className="mr-2" />
                      Add Section
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => setShowTemplateModal(true)} 
                    variant="outline"
                    className="flex items-center"
                  >
                    <FiFile className="mr-2" />
                    Load Template
                  </Button>
                  
                  <Button 
                    className="rounded-full p-3"
                    variant={isRecording ? "danger" : "primary"}
                    onClick={() => setShowMicModal(true)}
                  >
                    <FaMicrophone size={18} />
                  </Button>
                  <Button 
                    onClick={() => setShowVoiceRx(true)} 
                    variant="secondary"
                    className="flex items-center"
                  >
                    <FiMic className="mr-2" />
                    Voice Rx
                  </Button>
                  <Button onClick={() => {
                    if (!patient?._id) return toast.error('No patient selected');
                    const key = draftKeyFor(patient._id);
                    localStorage.setItem(key, JSON.stringify({ formData, customSections, sectionOrder }));
                    toast.success('Draft saved locally');
                  }} variant="outline">Save Draft</Button>

                  <Button onClick={() => {
                    if (!patient?._id) return toast.error('No patient selected');
                    const key = draftKeyFor(patient._id);
                    localStorage.removeItem(key);
                    toast.success('Draft cleared');
                  }} variant="outline">Clear Draft</Button>
                </div>
              </div>
              {/* Patient Details Card */}
              <PatientDetailsCard patient={patient} />
              <VitalsGrid vitals={formData.vitals} setFormData={setFormData} />

              <DndContext
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveId(active.id)}
                onDragEnd={({ active, over }) => {
                  setActiveId(null);
                  if (active.id !== over?.id) {
                    const oldIndex = sectionOrder.indexOf(active.id);
                    const newIndex = sectionOrder.indexOf(over.id);
                    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
                    updateSectionOrder(newOrder);
                  }
                }}
                onDragCancel={() => setActiveId(null)}
              >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  {sectionOrder.map((key) => (
                    <React.Fragment key={key}>
                      {sections[key] || <div key={key} className="text-gray-500 p-4">Section not found: {key}</div>}
                    </React.Fragment>
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div style={{ width: "100%" }}>
                      {sections[activeId] || <div className="text-gray-500 p-4">Section not found: {activeId}</div>}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <div className="flex flex-wrap gap-4 mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
                <Button 
                  onClick={handleSaveAndFinalize} 
                  loading={actionLoading}
                  size="lg"
                  className="flex items-center"
                >
                  <FiSave className="mr-2" />
                  Save & Finalize
                </Button>
                
                <Button 
                  onClick={() => setShowPrescriptionPreview(true)} 
                  variant="outline"
                  size="lg"
                  disabled={actionLoading}
                >
                  Print Prescription
                </Button>
                
                <Button 
                  onClick={handleSendWhatsApp} 
                  loading={actionLoading}
                  size="lg"
                  variant="success"
                  className="ml-auto flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Send via WhatsApp
                </Button>
                </div>
              <PastVisitsSection patient={patient} doctorId={doctorId} />
                </div>
              </div>
        </main>
          </div>
          
      {/* Template Selection Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onLoadTemplate={handleLoadTemplate}
        onSaveCustomTemplate={handleSaveCustomTemplate}
        customTemplateData={customTemplateData}
        setCustomTemplateData={setCustomTemplateData}
        showCustomForm={showCustomTemplateForm}
        setShowCustomForm={setShowCustomTemplateForm}
        inbuiltTemplates={INBUILT_TEMPLATES}
      />

      {/* Voice Rx Modal */}
      <VoiceRxModal
        isOpen={showVoiceRx}
        onClose={() => setShowVoiceRx(false)}
        doctorId={doctorId}
        patientId={patient?._id || null}
        onApply={handleVoiceRxApply}
      />

      {/* Microphone / Speech Recognition Modal */}
      <Modal
        isOpen={showMicModal}
        onClose={() => {
          stopRecognition();
          setShowMicModal(false);
          setMicError('');
        }}
        title="Voice Input"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Target Field</label>
            <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} className="w-full border rounded p-2 mt-1">
              <option value="auto">Auto-detect (vitals & keywords)</option>
              <optgroup label="Vitals">
                <option value="vital_bp">Blood Pressure (mmHg)</option>
                <option value="vital_pulse">Pulse Rate (bpm)</option>
                <option value="vital_height">Height (cm)</option>
                <option value="vital_weight">Weight (kg)</option>
                <option value="vital_temperature">Temperature (°F/°C)</option>
                <option value="vital_spo2">SpO2 (%)</option>
                <option value="vital_rbs">RBS (mg/dL)</option>
              </optgroup>
              <optgroup label="History / Findings">
                <option value="complaints">Chief Complaints</option>
                <option value="pastHistory">Past History</option>
                <option value="surgicalHistory">Surgical History</option>
                <option value="drugAllergy">Drug Allergy</option>
                <option value="examination">Physical Examination</option>
              </optgroup>
              <optgroup label="Diagnosis">
                <option value="diagnosis_provisional">Provisional Diagnosis</option>
                <option value="diagnosis_final">Final Diagnosis</option>
              </optgroup>
              <optgroup label="Investigations">
                <option value="tests">Investigations / Lab Test</option>
                <option value="testNotes">Note for Lab</option>
              </optgroup>
              <optgroup label="Medication">
                <option value="med_name">Medicine Name</option>
                <option value="med_dosage">Dosage</option>
                <option value="med_frequency">Frequency</option>
                <option value="med_duration">Duration</option>
                <option value="med_notes">Medication Notes</option>
              </optgroup>
              <optgroup label="Other">
                <option value="advice">Advice</option>
                <option value="followUp">Follow-up (date or note)</option>
              </optgroup>
              {customSections.map(s => (
                <option key={s.id} value={`custom:${s.id}`}>{s.heading}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button variant={isRecording ? 'danger' : 'primary'} onClick={() => { if (!isRecording) startRecognition(); else stopRecognition(); }}>
              {isRecording ? 'Stop' : 'Start'} Recording
            </Button>
            <Button variant="outline" onClick={() => { setTranscript(''); setMicError(''); }}>
              Clear
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium">Recognized Text</label>
            <textarea value={transcript} readOnly className="w-full border rounded p-2 mt-1 h-28" />
          </div>

          {micError && <div className="text-sm text-red-600">{micError}</div>}

          <div className="flex justify-end">
            <Button onClick={() => { stopRecognition(); if (transcript) applyTranscriptToTarget(transcript); setShowMicModal(false); }} variant="success">Done</Button>
          </div>
        </div>
      </Modal>

      {/* Prescription Preview Modal */}
      <PrescriptionPreviewModal
        isOpen={showPrescriptionPreview}
        onClose={() => setShowPrescriptionPreview(false)}
        patient={patient}
        formData={formData}
        doctorInfo={{
          name: 'Dr. John Doe',
          specialization: 'General Physician',
          phone: '+1 234 567 8900',
          email: 'doctor@example.com',
          address: '123 Medical Center Dr, City, State 12345'
        }}
        customSections={customSections}
        onPrint={() => {
          const doctorInfo = {
            name: 'Dr. John Doe',
            specialization: 'General Physician',
            phone: '+1 234 567 8900',
            email: 'doctor@example.com',
            address: '123 Medical Center Dr, City, State 12345'
          };
          printPrescription(patient, formData, doctorInfo, customSections);
          setShowPrescriptionPreview(false);
        }}
      />
    </div>
  );
};

export default ConsultationForm;
