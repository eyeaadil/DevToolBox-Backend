import Joi from 'joi';

export const createCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Collection name must be at least 1 character',
    'string.max': 'Collection name cannot exceed 100 characters',
    'any.required': 'Collection name is required',
  }),
  description: Joi.string().max(500).allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).messages({
    'string.pattern.base': 'Color must be a valid hex color (e.g., #3B82F6)',
  }),
  icon: Joi.string().max(50),
  isPublic: Joi.boolean(),
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(100).messages({
    'string.min': 'Collection name must be at least 1 character',
    'string.max': 'Collection name cannot exceed 100 characters',
  }),
  description: Joi.string().max(500).allow(''),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
  icon: Joi.string().max(50),
  isPublic: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});
