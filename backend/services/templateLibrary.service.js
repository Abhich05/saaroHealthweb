const TemplateLibrary = require('../models/templateLibrary');

const addTemplate = async ( doctorId, templateDetails ) => {
  try {
    const {
      name,
      type,
      items,
      creator,
    } = templateDetails;

    if (
      !name
      || !type
      || !items
      || !creator
    ) {
      return {
        statusCode: 400,
        error: `Template name, type, items, and creator are required`,
      };
    }

    const template = await TemplateLibrary.findOne({ name, doctorId });
    if (template) {
      return {
        statusCode: 409,
        error: `Template with name ${name} already exists`,
      };
    }

    const newTemplate = new TemplateLibrary({
      doctorId,
      sectionId: type.toLowerCase().replace(/\s+/g, '_'),
      sectionName: type,
      name,
      data: [{ content: items, creator }],
    });
    await newTemplate.save();

    return {
      statusCode: 201,
      template: {
        _id: newTemplate._id,
        name: newTemplate.name,
        type: newTemplate.sectionName,
        items: newTemplate.data[0]?.content || '',
        creator: newTemplate.data[0]?.creator || '',
        createdAt: newTemplate.createdAt,
        updatedAt: newTemplate.updatedAt,
      },
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

    const formattedTemplates = templates.map(template => ({
      _id: template._id,
      name: template.name,
      type: template.sectionName,
      items: template.data[0]?.content || '',
      creator: template.data[0]?.creator || '',
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));

    return {
      statusCode: 200,
      templates: formattedTemplates,
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
      name,
      type,
      items,
      creator,
    } = templateDetails;

    if (
      !name
      || !type
      || !items
      || !creator
    ) {
      return {
        statusCode: 400,
        error: `Template name, type, items, and creator are required`,
      };
    }

    const template = await TemplateLibrary.findByIdAndUpdate(
      templateId,
      { 
        sectionId: type.toLowerCase().replace(/\s+/g, '_'),
        sectionName: type,
        name,
        data: [{ content: items, creator }],
      },
      { new: true },
    );

    if (!template) {
      return {
        statusCode: 404,
        error: `Template not found`,
      };
    }

    return {
      statusCode: 200,
      template: {
        _id: template._id,
        name: template.name,
        type: template.sectionName,
        items: template.data[0]?.content || '',
        creator: template.data[0]?.creator || '',
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
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
      statusCode: 200,
      message: 'Template deleted successfully',
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
