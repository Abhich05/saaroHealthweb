const templateService = require('../services/templateLibrary.service');

const addTemplate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const templateDetails = req.body;
    
    const template = await templateService.addTemplate(doctorId, templateDetails);
    if (template?.error) {
      return res
        .status(template.statusCode)
        .send(template.error);
    }

    res
      .status(template.statusCode)
      .json({
        template: template.template,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getAllTemplatesByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const templates = await templateService.getAllTemplatesByDoctorId(doctorId);

    res
      .status(templates.statusCode)
      .json({
        templates: templates.templates,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const templateDetails = req.body;
    
    const template = await templateService.updateTemplate(templateId, templateDetails);
    if (template?.error) {
      return res
        .status(template.statusCode)
        .send(template.error);
    }

    res
      .status(template.statusCode)
      .json({
        template: template.template,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await templateService.deleteTemplate(templateId);
    if (template?.error) {
      return res
        .status(template.statusCode)
        .send(template.error);
    }

    res
      .status(template.statusCode)
      .json({
        message: 'Template deleted successfully',
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  addTemplate,
  getAllTemplatesByDoctorId,
  updateTemplate,
  deleteTemplate,
};
