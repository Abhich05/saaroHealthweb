const prescriptionSectionService = require('../services/prescriptionSection.service');

const addPrescriptionSection = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const prescriptionSectionData = req.body;
    
    const prescriptionSection = await prescriptionSectionService.addPrescriptionSection(doctorId, prescriptionSectionData);
    if (prescriptionSection?.error) {
      return res
        .status(prescriptionSection.statusCode)
        .send(prescriptionSection.error);
    }

    res
      .status(prescriptionSection.statusCode)
      .json({
        prescriptionSection: prescriptionSection.prescriptionSection,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllPrescriptionSectionByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const prescriptionSections = await prescriptionSectionService.getAllPrescriptionSectionByDoctorId(doctorId);

    res
      .status(prescriptionSections.statusCode)
      .json({
        prescriptionSections: prescriptionSections.prescriptionSections,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updatePrescriptionSection = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { printable } = req.body;
    
    const prescriptionSection = await prescriptionSectionService.updatePrescriptionSection(prescriptionId, printable);
    if (prescriptionSection?.error) {
      return res
        .status(prescriptionSection.statusCode)
        .send(prescriptionSection.error);
    }

    res
      .status(prescriptionSection.statusCode)
      .json({
        prescriptionSection: prescriptionSection.prescriptionSection,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deletePrescriptionSection = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const prescriptionSection = await prescriptionSectionService.deletePrescriptionSection(prescriptionId);
    if (prescriptionSection?.error) {
      return res
        .status(prescriptionSection.statusCode)
        .send(prescriptionSection.error);
    }

    res
      .status(prescriptionSection.statusCode)
      .json({
        message: 'Prescription Section deleted successfully',
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  addPrescriptionSection,
  getAllPrescriptionSectionByDoctorId,
  updatePrescriptionSection,
  deletePrescriptionSection,
};
