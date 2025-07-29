const dropdownService = require('../services/dropdownLibrary.service');

const addDropdown = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const dropdownDetails = req.body;

    const dropdown = await dropdownService.addDropdown(doctorId, dropdownDetails);
    if (dropdown?.error) {
      return res
        .status(dropdown.statusCode)
        .send(dropdown.error);
    }

    res
      .status(dropdown.statusCode)
      .json({
        dropdown: dropdown.dropdown,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllDropdownsByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const dropdowns = await dropdownService.getAllDropdownsByDoctorId(doctorId);
    if (dropdowns?.error) {
      return res
        .status(dropdowns.statusCode)
        .send(dropdowns.error);
    }

    res
      .status(dropdowns.statusCode)
      .json({
        dropdowns: dropdowns.dropdowns,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updateDropdown = async (req, res) => {
  try {
    const { dropdownId } = req.params;
    const dropdownDetails = req.body;

    const dropdown = await dropdownService.updateDropdown(dropdownId, dropdownDetails);
    if (dropdown?.error) {
      return res
        .status(dropdown.statusCode)
        .send(dropdown.error);
    }

    res
      .status(dropdown.statusCode)
      .json({
        dropdown: dropdown.dropdown,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deleteDropdown = async (req, res) => {
  try {
    const { dropdownId } = req.params;
    const dropdown = await dropdownService.deleteDropdown(dropdownId);
    if (dropdown?.error) {
      return res
        .status(dropdown.statusCode)
        .send(dropdown.error);
    }

    res
      .status(dropdown.statusCode)
      .json({
        message: 'Dropdown deleted successfully',
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  addDropdown,
  getAllDropdownsByDoctorId,
  updateDropdown,
  deleteDropdown,
};
