const ApiError = require('../utils/ApiError');
const config = require('../config');

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Invalid JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  // Known Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'This value already exists' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ success: false, message: 'A related record does not exist' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong, please try again',
    ...(!config.isProduction && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
