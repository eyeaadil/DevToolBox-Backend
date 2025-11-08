import Joi from 'joi';

export const createEnvironmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Environment name must be at least 1 character',
    'string.max': 'Environment name cannot exceed 100 characters',
    'any.required': 'Environment name is required',
  }),
  variables: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
  isActive: Joi.boolean().default(false),
});

export const updateEnvironmentSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  variables: Joi.object().pattern(Joi.string(), Joi.string()),
  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});
