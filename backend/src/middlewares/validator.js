import Joi from 'joi';
import { AppError } from './errorHandler.js';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    name: Joi.string().min(2).max(50).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Collection schema
  collection: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow(''),
  }),

  // Request schema
  apiRequest: Joi.object({
    collectionId: Joi.string().required(),
    name: Joi.string().min(1).max(100).required(),
    method: Joi.string()
      .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')
      .required(),
    url: Joi.string().uri().required(),
    headers: Joi.object().pattern(Joi.string(), Joi.string()),
    body: Joi.any(),
    params: Joi.object().pattern(Joi.string(), Joi.string()),
  }),

  // Regex pattern schema
  regexPattern: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    pattern: Joi.string().required(),
    flags: Joi.string().max(10).allow(''),
    description: Joi.string().max(500).allow(''),
    tags: Joi.array().items(Joi.string()),
    isPublic: Joi.boolean(),
  }),

  // Note schema
  note: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    projectId: Joi.string().allow(null),
  }),

  // Mock server schema
  mockServer: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow(''),
    routes: Joi.array().items(
      Joi.object({
        path: Joi.string().required(),
        method: Joi.string()
          .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH')
          .required(),
        statusCode: Joi.number().min(100).max(599).default(200),
        response: Joi.any().required(),
        delay: Joi.number().min(0).max(10000).default(0),
      })
    ),
  }),
};
