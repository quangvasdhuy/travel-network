/**
 * Input Validation Middleware
 * Validates request data using Joi schemas
 */

import Joi from 'joi';

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi schema object with body, params, query keys
 * @returns {Function} Express middleware
 */
const viMessages = {
  'any.required': '{{#label}} là bắt buộc',
  'any.only': '{{#label}} phải là một trong các giá trị được phép',
  'any.invalid': '{{#label}} không hợp lệ',
  'string.base': '{{#label}} phải là chuỗi ký tự',
  'string.empty': '{{#label}} không được để trống',
  'string.min': '{{#label}} phải có ít nhất {{#limit}} ký tự',
  'string.max': '{{#label}} không được vượt quá {{#limit}} ký tự',
  'string.length': '{{#label}} phải có đúng {{#limit}} ký tự',
  'string.email': '{{#label}} phải là địa chỉ email hợp lệ',
  'string.uri': '{{#label}} phải là đường dẫn hợp lệ',
  'string.uuid': '{{#label}} phải là UUID hợp lệ',
  'string.guid': '{{#label}} phải là UUID hợp lệ',
  'string.alphanum': '{{#label}} chỉ được chứa chữ cái và số',
  'string.pattern.base': '{{#label}} không đúng định dạng',
  'number.base': '{{#label}} phải là số',
  'number.integer': '{{#label}} phải là số nguyên',
  'number.min': '{{#label}} phải lớn hơn hoặc bằng {{#limit}}',
  'number.max': '{{#label}} phải nhỏ hơn hoặc bằng {{#limit}}',
  'number.positive': '{{#label}} phải là số dương',
  'boolean.base': '{{#label}} phải là true hoặc false',
  'array.base': '{{#label}} phải là một danh sách',
  'array.min': '{{#label}} phải có ít nhất {{#limit}} phần tử',
  'array.max': '{{#label}} không được có quá {{#limit}} phần tử',
  'object.base': '{{#label}} phải là một đối tượng',
  'object.missing': '{{#label}} phải có ít nhất một trong các trường {{#peersWithLabels}}',
  'object.unknown': '{{#label}} không được phép',
  'object.xor': '{{#label}} chỉ được có một trong các trường {{#peersWithLabels}}',
  'object.with': '{{#label}} phải đi kèm với {{#peerWithLabel}}',
  'object.without': '{{#label}} không được đi kèm với {{#peerWithLabel}}',
  'string.trim': '{{#label}} không được có khoảng trắng ở đầu hoặc cuối',
  'string.lowercase': '{{#label}} phải viết thường',
  'string.uppercase': '{{#label}} phải viết hoa',
  'array.includes': '{{#label}} chứa phần tử không hợp lệ',
  'array.unique': '{{#label}} không được có phần tử trùng lặp',
  'any.unknown': '{{#label}} không được phép',
  'number.greater': '{{#label}} phải lớn hơn {{#limit}}',
  'number.less': '{{#label}} phải nhỏ hơn {{#limit}}',
  'date.greater': '{{#label}} phải sau {{#limit}}',
  'date.less': '{{#label}} phải trước {{#limit}}',
  'date.base': '{{#label}} phải là ngày hợp lệ',
  'date.min': '{{#label}} phải sau {{#limit}}',
  'date.max': '{{#label}} phải trước {{#limit}}',
  'date.format': '{{#label}} không đúng định dạng ngày',
};

export const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys in the object
      stripUnknown: true, // Remove unknown keys
      messages: viMessages, // Thông báo lỗi mặc định bằng Tiếng Việt
    };

    const toValidate = {};
    const schemaKeys = {};
    
    if (schema.body) {
      toValidate.body = req.body;
      schemaKeys.body = schema.body;
    }
    if (schema.params) {
      toValidate.params = req.params;
      schemaKeys.params = schema.params;
    }
    if (schema.query) {
      toValidate.query = req.query;
      schemaKeys.query = schema.query;
    }

    const fullSchema = Joi.object(schemaKeys).unknown(true);
    const { error, value } = fullSchema.validate(toValidate, validationOptions);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Dữ liệu không hợp lệ',
          statusCode: 400,
          details: errors,
        },
      });
    }

    // Replace request data with validated/sanitized data
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Registration validation
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
        'any.required': 'Email là bắt buộc',
      }),
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ cái và số',
          'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự',
          'string.max': 'Tên đăng nhập không được vượt quá 30 ký tự',
          'any.required': 'Tên đăng nhập là bắt buộc',
        }),
      password: Joi.string()
        .min(8)
        .max(100)
        .required()
        .messages({
          'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
          'string.max': 'Mật khẩu không được vượt quá 100 ký tự',
          'any.required': 'Mật khẩu là bắt buộc',
        }),
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
    }),
  },

  // Login validation
  login: {
    body: Joi.object({
      emailOrUsername: Joi.string().required().messages({
        'any.required': 'Email hoặc tên đăng nhập là bắt buộc',
      }),
      password: Joi.string().required().messages({
        'any.required': 'Mật khẩu là bắt buộc',
      }),
    }),
  },

  // Refresh token validation
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token là bắt buộc',
      }),
    }),
  },

  // Email verification
  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Mã xác thực là bắt buộc',
      }),
    }),
  },

  // UUID parameter validation
  uuidParam: {
    params: Joi.object({
      id: Joi.string()
        .uuid()
        .required()
        .messages({
          'string.uuid': 'ID không đúng định dạng',
          'any.required': 'ID là bắt buộc',
        }),
    }),
  },

  // Pagination validation
  pagination: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string().optional(),
      order: Joi.string().valid('asc', 'desc').default('desc'),
    }),
  },
};

export default { validate, schemas };
