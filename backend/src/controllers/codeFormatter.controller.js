import { asyncHandler } from '../middlewares/errorHandler.js';
import { formatCode } from '../utils/codeFormatter.js';
import { successResponse } from '../utils/response.js';

/**
 * @desc    Format code
 * @route   POST /api/v1/code/format
 * @access  Public
 */
export const formatCodeHandler = asyncHandler(async (req, res) => {
  const { code, language = 'javascript', options = {} } = req.body;

  if (!code) {
    throw new Error('Code is required');
  }

  const formattedCode = await formatCode(code, language, options);
  
  successResponse(res, { 
    formatted: true, 
    language,
    formattedCode 
  }, 'Code formatted successfully');
});

/**
 * @desc    Get supported languages
 * @route   GET /api/v1/code/languages
 * @access  Public
 */
export const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = [
    { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    { id: 'python', name: 'Python', extensions: ['.py'] },
    { id: 'html', name: 'HTML', extensions: ['.html', '.htm'] },
    { id: 'css', name: 'CSS', extensions: ['.css'] },
    { id: 'scss', name: 'SCSS', extensions: ['.scss'] },
    { id: 'less', name: 'Less', extensions: ['.less'] },
    { id: 'json', name: 'JSON', extensions: ['.json'] },
  ];

  successResponse(res, { languages }, 'Supported languages retrieved');
});

/**
 * @desc    Get default options for a language
 * @route   GET /api/v1/code/options/:language
 * @access  Public
 */
export const getDefaultOptions = asyncHandler(async (req, res) => {
  const { language = 'javascript' } = req.params;
  
  const defaultOptions = {
    javascript: {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2,
      semi: true,
    },
    python: {
      lineLength: 88,
      stringNormalization: true,
    },
    html: {
      printWidth: 80,
      tabWidth: 2,
      htmlWhitespaceSensitivity: 'css',
    },
    css: {
      printWidth: 80,
      tabWidth: 2,
    },
    scss: {
      printWidth: 80,
      tabWidth: 2,
    },
    less: {
      printWidth: 80,
      tabWidth: 2,
    },
    json: {
      printWidth: 80,
      tabWidth: 2,
    },
  };

  const options = defaultOptions[language.toLowerCase()] || defaultOptions.javascript;
  
  successResponse(res, { 
    language,
    options 
  }, 'Default options retrieved');
});
