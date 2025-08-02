const Prescription = require('../models/prescription');
const Patient = require('../models/patient');
const DoctorPatient = require('../models/doctorPatient');
const Surgery = require('../models/surgery');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');
const { sendTemplateMessage } = require('../utils/whatsapp');

const createPrescription = async ( doctorId, patientId, prescriptionData ) => {
  try {
    const prescriptionExist = await Prescription.findOne({
      doctorId,
      patientId,
      status: 'draft',
    });

    await Patient.findByIdAndUpdate(patientId, {
      tags: prescriptionData?.tags,
      updatedAt: new Date(),
    }, { new: true});

    const doc = await DoctorPatient.findOne({ doctorId, patientId });
    if (doc) {
      doc.updatedAt = new Date();
      await doc.save();
    }

    let prescription;
    if (prescriptionExist) {
      prescription = await Prescription.findOneAndUpdate(
        prescriptionExist._id,
        { ...prescriptionData },
        { new: true },
      );
    } else {
      prescription = new Prescription({
        doctorId,
        patientId,
        status: 'draft',
        ...prescriptionData,
      });
      await prescription.save();
    }

    if (prescription?.implant && prescription.implant.length > 0) {
      for (const data of prescription.implant) {
        if (data?.name && data?.removalDate) {
          const surgeryExist = await Surgery.findOne({
            type: 'Implant',
            prescriptionId: prescription._id,
            doctorId,
            name: data.name,
            date: data.removalDate.toString(),
          });

          if (!surgeryExist) {
            const newSurgery = new Surgery({
              type: 'Implant',
              name: data.name,
              date: data.removalDate.toString(),
              doctorId,
              prescriptionId: prescription._id,
            });

            await newSurgery.save();
          }
        }
      }      
    }

    if (prescription?.surgeryAdvice) {
      if (prescription?.surgeryAdvice?.name && prescription?.surgeryAdvice?.date) {
        const surgeryExist = await Surgery.findOne({
          type: 'Surgery',
          doctorId,
          prescriptionId: prescription._id,
        });

        if (!surgeryExist) {
          const newSurgery = new Surgery({
            type: 'Surgery',
            name: prescription.surgeryAdvice.name,
            date: (prescription.surgeryAdvice.date).toString(),
            doctorId,
            prescriptionId: prescription._id,
          });

          await newSurgery.save();
        }
      }
    }

    return {
      statusCode: 201,
      prescription: prescription,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const endConsultationOfPrescription = async (doctorId, patientId, prescriptionData) => {
  try {
    let prescription = await Prescription.findOneAndUpdate({
      doctorId,
      patientId,
      status: 'draft',
    }, {
      ...prescriptionData,
      status: 'complete',
      consultationDate: new Date(),
    }, {
      new: true,
    });

    if (!prescription) {
      prescription = new Prescription({
        doctorId,
        patientId,
        status: 'complete',
        consultationDate: new Date(),
        ...prescriptionData,
      });
      await prescription.save();
    }

    const patient = await Patient.findByIdAndUpdate(patientId, {
      tags: prescriptionData?.tags,
      updatedAt: new Date(),
    }, { new: true });

    const doc = await DoctorPatient.findOne({ doctorId, patientId });
    if (doc) {
      doc.updatedAt = new Date();
      await doc.save();
    }
    await generatePrescriptionPDF(prescription, patient);

    if (prescription?.implant && prescription.implant.length > 0) {
      for (const data of prescription.implant) {
        if (data?.name && data?.removalDate) {
          const surgeryExist = await Surgery.findOne({
            type: 'Implant',
            prescriptionId: prescription._id,
            doctorId,
            name: data.name,
            date: data.removalDate.toString(),
          });

          if (!surgeryExist) {
            const newSurgery = new Surgery({
              type: 'Implant',
              name: data.name,
              date: data.removalDate.toString(),
              doctorId,
              prescriptionId: prescription._id,
            });

            await newSurgery.save();
          }
        }
      }      
    }

    if (prescription?.surgeryAdvice) {
      if (prescription?.surgeryAdvice?.name && prescription?.surgeryAdvice?.date) {
        const surgeryExist = await Surgery.findOne({
          type: 'Surgery',
          doctorId,
          prescriptionId: prescription._id,
        });

        if (!surgeryExist) {
          const newSurgery = new Surgery({
            type: 'Surgery',
            name: prescription.surgeryAdvice.name,
            date: (prescription.surgeryAdvice.date).toString(),
            doctorId,
            prescriptionId: prescription._id,
          });

          await newSurgery.save();
        }
      }
    }

    sendTemplateMessage(
      process.env.NODE_ENV === 'development' ? '+919983221046' : patient?.phoneNumber,
      {
        language: 'en',
        templateData: {
          header: {
            mediaUrl: `${process.env.SERVER_URL}/public/prescriptions/prescription_${prescription._id}.pdf`,
            type: 'DOCUMENT',
            filename: `${prescription._id}`,
          },
          body: {placeholders: [patient.fullName ? patient.fullName : 'Patient']},
        },
        templateName: 'prescription'
      },
    );

    return {
      statusCode: 201,
      prescription,
      pdfPath: `${process.env.SERVER_URL}/public/prescriptions/prescription_${prescription._id}.pdf`,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

// New function to save consultation data as past visit
const saveConsultationAsPastVisit = async (doctorId, patientId, consultationData) => {
  try {
    // Create a new prescription with complete status
    const prescription = new Prescription({
      doctorId,
      patientId,
      status: 'complete',
      consultationDate: new Date(),
      ...consultationData,
    });

    await prescription.save();

    // Update patient's last visit
    await Patient.findByIdAndUpdate(patientId, {
      updatedAt: new Date(),
    }, { new: true });

    // Update doctor-patient relationship
    const doc = await DoctorPatient.findOne({ doctorId, patientId });
    if (doc) {
      doc.updatedAt = new Date();
      await doc.save();
    }

    return {
      statusCode: 201,
      prescription: prescription,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getPrescriptionsByPatientId = async ( doctorId, patientId ) => {
  try {
    const prescriptions = await Prescription.find({
      doctorId,
      patientId,
      status: 'complete'
    }).sort({ consultationDate: -1, updatedAt: -1 });

    return {
      statusCode: 200,
      prescriptions: prescriptions,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getDraftPrescriptionOfPatient = async ( doctorId, patientId ) => {
  try {
    const prescription = await Prescription.findOne({
      doctorId,
      patientId,
      status: 'draft',
    });

    if (!prescription) {
      return {
        statusCode: 404,
        prescription: 'Prescription is not drafted yet.',
      };
    }

    return {
      statusCode: 200,
      prescription: prescription,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

// New function to get patient's consultation history
const getPatientConsultationHistory = async (doctorId, patientId) => {
  try {
    const consultations = await Prescription.find({
      doctorId,
      patientId,
      status: 'complete'
    })
    .populate('doctorId', 'name specialization')
    .sort({ consultationDate: -1 })
    .select('consultationDate consultationType vitals complaints diagnosis medication advice notes status');

    return {
      statusCode: 200,
      consultations: consultations,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

module.exports = {
  createPrescription,
  endConsultationOfPrescription,
  saveConsultationAsPastVisit,
  getPrescriptionsByPatientId,
  getDraftPrescriptionOfPatient,
  getPatientConsultationHistory,
};
