const Library = require('../models/library');
const Dropdown = require('../models/dropdown');
const Surgery = require('../models/surgery');

const addLibrary = async ( libraryDetails ) => {
  try {
    const {
      id,
      name,
      fields,
    } = libraryDetails;

    if (
      id === undefined
      || !name
      || fields.length === 0
    ) {
      return {
        statusCode: 400,
        error: `Id, name and fields must be required`,
      };
    }

    const library = await Library.findOne({ id });
    if (library) {
      return {
        statusCode: 409,
        error: `Library of ${id} already exist`,
      };
    }

    const newLibrary = new Library({
      id,
      name,
      fields,
    });
    await newLibrary.save();

    return {
      statusCode: 201,
      library: newLibrary,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllLibrary = async () => {
  try {
    const libraries = await Library.find({});

    return {
      statusCode: 200,
      libraries,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const addDropdown = async ( dropdownDetails ) => {
  try {
    const {
      id,
      name,
    } = dropdownDetails;

    if (
      id === undefined
      || !name
    ) {
      return {
        statusCode: 400,
        error: `Id and name is required`,
      };
    }

    const dropdown = await Dropdown.findOne({ id });
    if (dropdown) {
      return {
        statusCode: 409,
        error: `Dropdown of ${id} already exist`,
      };
    }

    const newDropdown = new Dropdown({
      id,
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

const getAllDropdowns = async () => {
  try {
    const dropdowns = await Dropdown.find({});

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

const getSurgery = async (doctorId, type, from, to) => {
  try {
    if (!doctorId || !type || !from || !to) {
      return {
        statusCode: 400,
        error: 'Missing required parameters',
      };
    }

    const surgeries = await Surgery.find({
      doctorId,
      type: type,
      // date: { $gte: from, $lte: to },
    });

    return {
      statusCode: 200,
      data: surgeries,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message,
    };
  }
};

module.exports = {
  addLibrary,
  getAllLibrary,
  addDropdown,
  getAllDropdowns,
  getSurgery,
};
