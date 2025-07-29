const medicineService = require('../services/medicineLibrary.service');

const addMedicine = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const medicineDetails = req.body;
    
    const medicine = await medicineService.addMedicine(doctorId, medicineDetails);
    if (medicine?.error) {
      return res
        .status(medicine.statusCode)
        .send(medicine.error);
    }

    res
      .status(medicine.statusCode)
      .json({
        medicine: medicine.medicine,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllMedicinesByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const medicines = await medicineService.getAllMedicinesByDoctorId(doctorId);

    res
      .status(medicines.statusCode)
      .json({
        medicines: medicines.medicines,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const medicine = await medicineService.deleteMedicine(medicineId);
    if (medicine?.error) {
      return res
        .status(medicine.statusCode)
        .send(medicine.error);
    }

    res
      .status(medicine.statusCode)
      .json({
        message: `Medicine deleted successfully`,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  addMedicine,
  getAllMedicinesByDoctorId,
  deleteMedicine,
};
