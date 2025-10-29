import crypto from 'crypto';

// Generate random string
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash string with SHA256
export const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Parse pagination params
export const parsePagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Format date to ISO string
export const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Check if string is valid JSON
export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined/null values from object
export const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
