const zod = require('zod');

const stringSchema = zod.string().min(3);
const idSchema = zod.string().length(24);
const dateSchema = zod.string().datetime();
const statusSchema = zod.enum(['in-progress', 'pending', 'completed']);
const prioritySchema = zod.enum(['low', 'medium', 'high']);

const validateTodo = (todoData, userId) => {
  const { title, description, status, dueDate, priority } = todoData;

  const titleValidation = stringSchema.safeParse(title);
  if (!titleValidation.success) {
    return {
      error: 'Title must be of atleast 3 characters',
    };
  }

  const descriptionValidation = stringSchema.safeParse(description);
  if (!descriptionValidation.success) {
    return {
      error: 'Description must be of atleast 3 characters',
    };
  }

  const statusValidation = statusSchema.safeParse(status);
  if (!statusValidation.success) {
    return {
      error: 'Status must be either in-progress or pending or completed',
    };
  }

  const userIdValidation = idSchema.safeParse(userId);
  if (!userIdValidation.success) {
    return {
      error: 'User id is not valid, it should be of 24 characters',
    };
  }

  const dueDateValidation = dateSchema.safeParse(dueDate);
  if (!dueDateValidation.success) {
    return {
      error: 'Date is not valid, it should be of type date',
    };
  }

  const priorityValidation = prioritySchema.safeParse(priority);
  if (!priorityValidation.success) {
    return {
      error: 'Priority must be either low or medium or high',
    };
  }
}

module.exports = {
  validateTodo,
};
