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
    // surgeryAdvice: {
    //   type: String,
    //   default: null,
    // },
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
    },
    additionalVitals: [{}],
    additionalSections: [{}],
  },
  {
    timestamps: true,
  },
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
