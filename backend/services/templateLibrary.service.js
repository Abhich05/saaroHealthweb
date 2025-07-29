const TemplateLibrary = require('../models/templateLibrary');

const addTemplate = async ( doctorId, templateDetails ) => {
  try {
    const {
      sectionId,
      sectionName,
      name,
      data,
    } = templateDetails;

    if (
      !sectionId
      || !sectionName
      || !name
      || !data.length
    ) {
      return {
        statusCode: 400,
        error: `Template sectionId, sectionName, name and data is required`,
      };
    }

    const template = await TemplateLibrary.findOne({ name });
    if (template) {
      return {
        statusCode: 409,
        error: `Template with name ${name} already exist`,
      };
    }

    const newTemplate = new TemplateLibrary({
      doctorId,
      sectionId,
      sectionName,
      name,
      data,
    });
    await newTemplate.save();

    return {
      statusCode: 201,
      template: newTemplate,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getAllTemplatesByDoctorId = async ( doctorId ) => {
  try {
    const templates = await TemplateLibrary.find({ doctorId });

    return {
      statusCode: 200,
      templates,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const updateTemplate = async ( templateId, templateDetails ) => {
  try {
    const {
      sectionId,
      sectionName,
      name,
      data,
    } = templateDetails;

    if (
      !sectionId
      || !sectionName
      || !name
      || !data.length
    ) {
      return {
        statusCode: 400,
        error: `Template sectionId, sectionName, name and data is required`,
      };
    }

    const template = await TemplateLibrary.findByIdAndUpdate(
      templateId,
      { data },
      { new: true },
    );

    if (!template) {
      return {
        statusCode: 404,
        error: `Template with name ${name} not found`,
      };
    }

    return {
      statusCode: 200,
      template: template,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deleteTemplate = async ( templateId ) => {
  try {
    const template = await TemplateLibrary.findByIdAndDelete(templateId);

    if (!template) {
      return {
        statusCode: 404,
        error: 'Template not found',
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
  addTemplate,
  getAllTemplatesByDoctorId,
  updateTemplate,
  deleteTemplate,
};
