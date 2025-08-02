const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    patientId: {
      index: true,
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    // Vitals
    vitals: {
      bloodPressure: { type: String, default: '' },
      pulse: { type: String, default: '' },
      height: { type: String, default: '' },
      weight: { type: String, default: '' },
      temperature: { type: String, default: '' },
      painScore: { type: String, default: '' },
      oxygenSaturation: { type: String, default: '' },
      respiratoryRate: { type: String, default: '' },
    },
    // Chief Complaints
    complaints: [{
      text: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    // History
    pastHistory: [{
      value: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    surgicalHistory: [{
      value: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    drugAllergy: [{
      value: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    // Physical Examination
    physicalExamination: [{
      text: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    // Diagnosis
    diagnosis: {
      provisional: [{
        value: { type: String, default: '' },
        id: { type: String, default: '' }
      }],
      final: [{
        value: { type: String, default: '' },
        id: { type: String, default: '' }
      }]
    },
    // Investigations
    tests: [{
      value: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    // Medications
    medication: [{
      name: { type: String, default: '' },
      dosage: { type: String, default: '' },
      frequency: { type: String, default: '' },
      duration: { type: String, default: '' },
      notes: { type: String, default: '' },
      id: { type: String, default: '' }
    }],
    // Advice and Follow-up
    advice: { type: String, default: '' },
    followUp: [{
      type: String,
      default: ''
    }],
    // Custom Sections
    customSections: [{
      id: { type: String, required: true },
      heading: { type: String, required: true },
      fields: [{
        label: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        values: [{
          value: { type: String, default: '' },
          id: { type: String, default: '' }
        }]
      }]
    }],
    // Legacy fields for backward compatibility
    bloodPressure: {
      type: String,
      default: null,
    },
    pulse: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
    temperature: {
      type: String,
      default: null,
    },
    painScore: {
      type: String,
      default: null,
    },
    complaints: [{
      type: String,
      default: null,
    }],
    history: [{
      type: String,
      default: null,
    }],
    drugHistory: [
      {
        name: {
          type: String,
          default: null,
        },
        details: {
          type: String,
          default: null,
        },
      },
    ],
    drugAllergy: [
      {
        name: {
          type: String,
          default: null,
        },
        details: {
          type: String,
          default: null,
        },
      },
    ],
    antiplatlet: [
      {
        name: {
          type: String,
          default: null,
        },
        details: {
          type: String,
          default: null,
        },
      },
    ],
    previousSurgery: {
      type: String,
      default: null,
    },
    provisional: {
      type: String,
      default: null,
    },
    physicalExamination: [{
      type: String,
      default: null,
    }],
    investigationsAdviced: [
      {
        name: {
          type: String,
          default: null,
        },
        details: {
          type: String,
          default: null,
        },
      },
    ],
    diagnosis: [
      {
        type: {
          type: String,
          default: null,
        },
        details: {
          type: String,
          default: null,
        },
      },
    ],
    medications: [
      {
        name: {
          type: String,
          default: null,
        },
        dosage: {
          type: String,
          default: null,
        },
        frequency: {
          type: String,
          default: null,
        },
        duration: {
          type: String,
          default: null,
        },
        notes: {
          type: String,
          default: null,
        },
        composition: {
          type: String,
          default: null,
        },
      },
    ],
    advice: [{
      type: String,
      default: null,
    }],
    followUp: {
      days: {
        type: String,
        default: null,
      },
      date: {
        type: String,
        default: null,
      },
    },
    referredTo: [{
      name: {
        type: String,
        default: null,
      },
      speciality: {
        type: String,
        default: null,
      },
    }],
    referredBy: {
      name: {
        type: String,
        default: null,
      },
      speciality: {
        type: String,
        default: null,
      },
    },
    implant: [
      {
        name: {
          type: String,
          default: null,
        },
        removalDate: {
          type: String,
          default: null,
        },
      }
    ],
    surgeryAdvice: {
      name: {
        type: String,
        default: null,
      },
      date: {
        type: String,
        default: null,
      },
    },
    tags: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'draft',
      enum: ['draft', 'complete', 'archived']
    },
    additionalVitals: [{}],
    additionalSections: [{}],
    // Consultation metadata
    consultationDate: {
      type: Date,
      default: Date.now,
    },
    consultationType: {
      type: String,
      default: 'general',
      enum: ['general', 'followup', 'emergency', 'specialty']
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
