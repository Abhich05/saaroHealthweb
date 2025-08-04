const DropdownLibrary = require('../models/dropdownLibrary');

const addDropdown = async ( doctorId, dropdownDetails ) => {
  try {
    const {
      sectionId,
      sectionName,
      name,
      creator = "System"
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

    // Check for duplicate entries in the same section
    const existingDropdown = await DropdownLibrary.findOne({ 
      doctorId, 
      sectionId, 
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive match
    });
    
    if (existingDropdown) {
      return {
        statusCode: 409,
        error: `Dropdown entry '${name}' already exists in this section`,
      };
    }

    const newDropdown = new DropdownLibrary({
      doctorId,
      sectionId,
      sectionName,
      name,
      creator
    });
    await newDropdown.save();

    return {
      statusCode: 201,
      dropdown: newDropdown,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const getAllDropdownsByDoctorId = async ( doctorId ) => {
  try {
    const dropdowns = await DropdownLibrary.find({ doctorId }).sort({ createdAt: -1 });

    return {
      statusCode: 200,
      dropdowns,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const getDropdownsBySection = async ( doctorId, sectionId ) => {
  try {
    const dropdowns = await DropdownLibrary.find({ 
      doctorId, 
      sectionId 
    }).sort({ name: 1 });

    return {
      statusCode: 200,
      dropdowns,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const getAllDropdownsGroupedBySection = async ( doctorId ) => {
  try {
    const dropdowns = await DropdownLibrary.find({ doctorId }).sort({ sectionName: 1, name: 1 });
    
    // Group dropdowns by section
    const groupedDropdowns = dropdowns.reduce((acc, dropdown) => {
      if (!acc[dropdown.sectionId]) {
        acc[dropdown.sectionId] = {
          sectionId: dropdown.sectionId,
          sectionName: dropdown.sectionName,
          options: []
        };
      }
      acc[dropdown.sectionId].options.push({
        id: dropdown._id,
        name: dropdown.name,
        creator: dropdown.creator
      });
      return acc;
    }, {});

    return {
      statusCode: 200,
      dropdowns: Object.values(groupedDropdowns),
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
}

const updateDropdown = async ( dropdownId, dropdownDetails ) => {
  try {
    const {
      name,
      sectionId,
      sectionName,
      creator
    } = dropdownDetails;

    if (!name) {
      return {
        statusCode: 400,
        error: `Dropdown name is required`,
      };
    }

    // Check for duplicate entries in the same section (excluding current entry)
    const existingDropdown = await DropdownLibrary.findOne({ 
      _id: { $ne: dropdownId },
      sectionId, 
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive match
    });
    
    if (existingDropdown) {
      return {
        statusCode: 409,
        error: `Dropdown entry '${name}' already exists in this section`,
      };
    }

    const updateData = { name };
    if (sectionId) updateData.sectionId = sectionId;
    if (sectionName) updateData.sectionName = sectionName;
    if (creator) updateData.creator = creator;

    const dropdown = await DropdownLibrary.findByIdAndUpdate(
      dropdownId,
      updateData,
      { new: true },
    );

    if (!dropdown) {
      return {
        statusCode: 404,
        error: `Dropdown not found`,
      };
    }

    return {
      statusCode: 200,
      dropdown: dropdown,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
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
      error: error.message,
    };
  }
}

module.exports = {
  addDropdown,
  getAllDropdownsByDoctorId,
  getDropdownsBySection,
  getAllDropdownsGroupedBySection,
  updateDropdown,
  deleteDropdown,
};
