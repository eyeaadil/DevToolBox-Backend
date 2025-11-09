import { execSync } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Format JavaScript/TypeScript code using Prettier
 * @param {string} code - The code to format
 * @param {object} options - Formatting options
 * @returns {Promise<string>} Formatted code
 */
export const formatJavaScript = async (code, options = {}) => {
  try {
    // Try to use local Prettier first
    try {
      const prettier = await import('prettier');
      return await prettier.format(code, {
        parser: 'babel',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 80,
        ...options,
      });
    } catch (e) {
      // Fallback to global Prettier if local not found
      return execSync(`npx prettier --stdin --parser=babel`, {
        input: code,
        encoding: 'utf8',
      });
    }
  } catch (error) {
    throw new Error(`JavaScript formatting failed: ${error.message}`);
  }
};

/**
 * Format Python code using Black
 * @param {string} code - The code to format
 * @returns {Promise<string>} Formatted code
 */
export const formatPython = async (code) => {
  try {
    return execSync('black -', { input: code, encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Python formatting failed. Make sure Black is installed: pip install black`);
  }
};

/**
 * Format HTML code
 * @param {string} code - The HTML code to format
 * @param {object} options - Formatting options
 * @returns {Promise<string>} Formatted HTML
 */
export const formatHTML = async (code, options = {}) => {
  try {
    const prettier = await import('prettier');
    return await prettier.format(code, {
      parser: 'html',
      printWidth: 80,
      tabWidth: 2,
      ...options,
    });
  } catch (error) {
    throw new Error(`HTML formatting failed: ${error.message}`);
  }
};

/**
 * Format CSS/SCSS/Less code
 * @param {string} code - The CSS code to format
 * @param {string} language - The CSS variant (css, scss, less)
 * @param {object} options - Formatting options
 * @returns {Promise<string>} Formatted CSS
 */
export const formatCSS = async (code, language = 'css', options = {}) => {
  try {
    const prettier = await import('prettier');
    return await prettier.format(code, {
      parser: language,
      ...options,
    });
  } catch (error) {
    throw new Error(`${language.toUpperCase()} formatting failed: ${error.message}`);
  }
};

/**
 * Format JSON code
 * @param {string} code - The JSON code to format
 * @param {object} options - Formatting options
 * @returns {Promise<string>} Formatted JSON
 */
export const formatJSON = async (code, options = {}) => {
  try {
    const prettier = await import('prettier');
    return await prettier.format(code, {
      parser: 'json',
      ...options,
    });
  } catch (error) {
    throw new Error(`JSON formatting failed: ${error.message}`);
  }
};

/**
 * Format code based on language
 * @param {string} code - The code to format
 * @param {string} language - The programming language
 * @param {object} options - Language-specific formatting options
 * @returns {Promise<string>} Formatted code
 */
export const formatCode = async (code, language = 'javascript', options = {}) => {
  const normalizedLang = language.toLowerCase();
  
  switch (normalizedLang) {
    case 'javascript':
    case 'typescript':
    case 'js':
    case 'ts':
      return formatJavaScript(code, options);
    
    case 'python':
    case 'py':
      return formatPython(code);
    
    case 'html':
      return formatHTML(code, options);
    
    case 'css':
    case 'scss':
    case 'less':
      return formatCSS(code, normalizedLang, options);
    
    case 'json':
      return formatJSON(code, options);
    
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};
