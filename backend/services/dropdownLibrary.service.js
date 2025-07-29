const DropdownLibrary = require('../models/dropdownLibrary');

const addDropdown = async ( doctorId, dropdownDetails ) => {
  try {
    const {
      sectionId,
      sectionName,
      name,
    } = dropdownDetails;

    if (
      !sectionId
      || !sectionName
      || !name
    ) {
      return {
        statusCode: 400,
        error: `Dropdown sectionId, sectionName and name is required`,
      };
    }

    // const dropdown = await DropdownLibrary.findOne({ name });
    // if (dropdown) {
    //   return {
    //     statusCode: 409,
    //     error: `Dropdown with name '${name}' already exist`,
    //   };
    // }

    const newDropdown = new DropdownLibrary({
      doctorId,
      sectionId,
      sectionName,
      name,
    });
    await newDropdown.save();

    return {
      statusCode: 201,
      dropdown: newDropdown,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllDropdownsByDoctorId = async ( doctorId ) => {
  try {
    const dropdowns = await DropdownLibrary.find({ doctorId });

    return {
      statusCode: 200,
      dropdowns,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const updateDropdown = async ( dropdownId, dropdownDetails ) => {
  try {
    const {
      name,
    } = dropdownDetails;

    if (!name) {
      return {
        statusCode: 400,
        error: `Dropdown name is required`,
      };
    }

    const dropdown = await DropdownLibrary.findByIdAndUpdate(
      dropdownId,
      { name },
      { new: true },
    );

    if (!dropdown) {
      return {
        statusCode: 404,
        error: `Dropdown with name '${name}' not found`,
      };
    }

    return {
      statusCode: 200,
      dropdown: dropdown,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deleteDropdown = async ( dropdownId ) => {
  try {
    const dropdown = await DropdownLibrary.findByIdAndDelete(dropdownId);

    if (!dropdown) {
      return {
        statusCode: 404,
        error: 'Dropdown not found',
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
  addDropdown,
  getAllDropdownsByDoctorId,
  updateDropdown,
  deleteDropdown,
};
