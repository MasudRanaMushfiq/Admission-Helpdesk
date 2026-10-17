const ApiError = require('./ApiError');

function sendOk(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

// Numeric id from the URL
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'Invalid id');
  }
  return id;
}

module.exports = { sendOk, parseId };
