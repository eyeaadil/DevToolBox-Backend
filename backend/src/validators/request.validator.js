import Joi from 'joi';

export const createRequestSchema = Joi.object({
  collectionId: Joi.string().required().messages({
    'any.required': 'Collection ID is required',
  }),
  name: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Request name must be at least 1 character',
    'string.max': 'Request name cannot exceed 200 characters',
    'any.required': 'Request name is required',
  }),
  method: Joi.string()
    .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')
    .required()
    .messages({
      'any.only': 'Method must be one of: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
      'any.required': 'HTTP method is required',
    }),
  url: Joi.string().uri().required().messages({
    'string.uri': 'URL must be a valid URI',
    'any.required': 'URL is required',
  }),
  headers: Joi.object().pattern(Joi.string(), Joi.string()),
  queryParams: Joi.object().pattern(Joi.string(), Joi.string()),
  body: Joi.any(),
  bodyType: Joi.string()
    .valid('none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary')
    .default('none'),
  auth: Joi.object({
    type: Joi.string().valid('none', 'bearer', 'basic', 'api-key').default('none'),
    token: Joi.string().allow(''),
    username: Joi.string().allow(''),
    password: Joi.string().allow(''),
    apiKey: Joi.string().allow(''),
    apiValue: Joi.string().allow(''),
  }),
  description: Joi.string().max(1000).allow(''),
  order: Joi.number().integer().min(0),
});

export const updateRequestSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'),
  url: Joi.string().uri(),
  headers: Joi.object().pattern(Joi.string(), Joi.string()),
  queryParams: Joi.object().pattern(Joi.string(), Joi.string()),
  body: Joi.any(),
  bodyType: Joi.string().valid('none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw', 'binary'),
  auth: Joi.object({
    type: Joi.string().valid('none', 'bearer', 'basic', 'api-key'),
    token: Joi.string().allow(''),
    username: Joi.string().allow(''),
    password: Joi.string().allow(''),
    apiKey: Joi.string().allow(''),
    apiValue: Joi.string().allow(''),
  }),
  description: Joi.string().max(1000).allow(''),
  order: Joi.number().integer().min(0),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const executeRequestSchema = Joi.object({
  method: Joi.string()
    .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')
    .required(),
  url: Joi.string().uri().required(),
  headers: Joi.object().pattern(Joi.string(), Joi.string()),
  body: Joi.any(),
  timeout: Joi.number().integer().min(1000).max(60000).default(30000),
});
