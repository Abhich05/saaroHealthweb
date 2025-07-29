const PrescriptionSection = require('../models/prescriptionSection');

const addPrescriptionSection = async ( doctorId, prescriptionSectionData ) => {
  try {
    const {
      label,
      fieldType,
      placeholder,
      sectionType,
      printable,
    } = prescriptionSectionData;

    if (
      !label
      || !fieldType
      || !sectionType
    ) {
      return {
        statusCode: 400,
        error: `Prescription section label, fieldType and sectionType is required`,
      };
    }

    const prescriptionSection = await PrescriptionSection.findOne({ label, fieldType, sectionType });
    if (prescriptionSection) {
      return {
        statusCode: 409,
        error: `Prescription Section with label '${label}' already exist`,
      };
    }

    const newPrescriptionSection = new PrescriptionSection({
      doctorId,
      label,
      fieldType,
      placeholder,
      sectionType,
      printable,
    });
    await newPrescriptionSection.save();

    return {
      statusCode: 201,
      prescriptionSection: newPrescriptionSection,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllPrescriptionSectionByDoctorId = async ( doctorId ) => {
  try {
    const prescriptionSections = await PrescriptionSection.find({ doctorId });

    return {
      statusCode: 200,
      prescriptionSections,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const updatePrescriptionSection = async ( prescriptionId, printable ) => {
  try {
    if (
      printable === null
      || printable === undefined
    ) {
      return {
        statusCode: 400,
        error: `Printable is required`,
      };
    }

    const prescriptionSection = await PrescriptionSection.findByIdAndUpdate(
      prescriptionId,
      { printable },
      { new: true },
    );

    if (!prescriptionSection) {
      return {
        statusCode: 404,
        error: `Prescription Section not found`,
      };
    }

    return {
      statusCode: 200,
      prescriptionSection,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deletePrescriptionSection = async ( prescriptionId ) => {
  try {
    const prescriptionSection = await PrescriptionSection.findByIdAndDelete(prescriptionId);

    if (!prescriptionSection) {
      return {
        statusCode: 404,
        error: 'Prescription Section not found',
      };
    }

    return {
      statusCode: 204,
    };
  } catch (error) {
    return {
      statusCode: 500, 
      error: error,
    };
  }
}

module.exports = {
  addPrescriptionSection,
  getAllPrescriptionSectionByDoctorId,
  updatePrescriptionSection,
  deletePrescriptionSection,
};
