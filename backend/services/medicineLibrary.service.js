const MedicineLibrary = require('../models/medicineLibrary');

const addMedicine = async ( doctorId, medicineDetails ) => {
  try {
    const {
      medicineName,
      composition,
    } = medicineDetails;

    if (
      !medicineName
      || !composition
    ) {
      return {
        statusCode: 400,
        error: `Medicine name and composition both are required`,
      };
    }

    const medicine = await MedicineLibrary.findOne({ medicineName });
    if (medicine) {
      return {
        statusCode: 409,
        error: `${medicineName} Medicine already exist`,
      };
    }

    const newMedicine = new MedicineLibrary({
      doctorId,
      medicineName,
      composition,
    });
    await newMedicine.save();

    return {
      statusCode: 201,
      medicine: newMedicine,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllMedicinesByDoctorId = async ( doctorId ) => {
  try {
    const medicines = await MedicineLibrary.find({ doctorId });

    return {
      statusCode: 200,
      medicines,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deleteMedicine = async ( medicineId ) => {
  try {
    const medicine = await MedicineLibrary.findByIdAndDelete(medicineId);

    if (!medicine) {
      return {
        statusCode: 404,
        error: 'Medicine not found',
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
  addMedicine,
  getAllMedicinesByDoctorId,
  deleteMedicine,
};
