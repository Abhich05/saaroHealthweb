const libraryService = require('../services/library.service');

const addLibrary = async (req, res) => {
  try {
    const libraryDetails = req.body;

    const library = await libraryService.addLibrary(libraryDetails);
    if (library?.error) {
      return res
        .status(library.statusCode)
        .send(library.error);
    }

    res
      .status(library.statusCode)
      .json({
        library: library.library,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllLibrary = async (req, res) => {
  try {
    const libraries = await libraryService.getAllLibrary();

    res
      .status(libraries.statusCode)
      .json({
        libraries: libraries.libraries,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const addDropdown = async (req, res) => {
  try {
    const dropdownDetails = req.body;

    const dropdown = await libraryService.addDropdown(dropdownDetails);
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

const getAllDropdowns = async (req, res) => {
  try {
    const dropdowns = await libraryService.getAllDropdowns();

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

const getSurgery = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { type, from, to } = req.query;
    const surgery = await libraryService.getSurgery(doctorId, type, from, to);

    if (type === 'Surgery') {
      return res
        .status(surgery.statusCode)
        .json({
          surgery: surgery.data,
        });
    }

    res
      .status(surgery.statusCode)
      .json({
        implant: surgery.data,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  addLibrary,
  getAllLibrary,
  addDropdown,
  getAllDropdowns,
  getSurgery,
};
