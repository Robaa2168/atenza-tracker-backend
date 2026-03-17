// File: backend/src/middlewares/validate.js
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: result.error.flatten()
    });
    return;
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
