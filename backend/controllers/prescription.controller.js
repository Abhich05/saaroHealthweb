const prescriptionService = require('../services/prescription.service');

const createPrescription = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const { doctorId, patientId } = req.params;

    const prescription = await prescriptionService.createPrescription(doctorId, patientId, prescriptionData);

    res
      .status(prescription.statusCode)
      .json({
        prescription: prescription.prescription,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const endConsultationOfPrescription = async (req, res) => {
  try {
    const prescriptionData = req.body;
    const { doctorId, patientId } = req.params;

    const prescription = await prescriptionService.endConsultationOfPrescription(doctorId, patientId, prescriptionData);

    res
      .status(prescription.statusCode)
      .json({
        prescription: prescription?.prescription,
        pdfPath: prescription?.pdfPath,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const prescriptions = await prescriptionService.getPrescriptionsByPatientId(doctorId, patientId);

    res
      .status(prescriptions.statusCode)
      .json({
        prescriptions: prescriptions.prescriptions,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getDraftPrescriptionOfPatient = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const prescription = await prescriptionService.getDraftPrescriptionOfPatient(doctorId, patientId);

    res
      .status(prescription.statusCode)
      .json({
        prescription: prescription?.prescription,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  createPrescription,
  endConsultationOfPrescription,
  getPrescriptionsByPatientId,
  getDraftPrescriptionOfPatient,
};
