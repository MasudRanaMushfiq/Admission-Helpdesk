const ApiError = require('../utils/ApiError');

// Validator returns { field: message }, empty = valid
function validate(validator) {
  return (req, res, next) => {
    const body = req.body || {};

    // Trim strings except passwords
    for (const key of Object.keys(body)) {
      if (typeof body[key] === 'string' && !key.toLowerCase().includes('password')) {
        body[key] = body[key].trim();
      }
    }
    req.body = body;

    const errors = validator(body);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(400, 'Please fix the highlighted fields', errors);
    }
    next();
  };
}

module.exports = validate;
