const ApiError = require('../utils/ApiError');
const tokenService = require('../services/token.service');

// Bearer token -> req.user
async function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Please log in first');
  }

  const user = await tokenService.findUserByToken(token);
  if (!user) {
    throw new ApiError(401, 'Your session has expired, please log in again');
  }

  req.user = { id: user.id, role: user.role };
  req.token = token;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      throw new ApiError(403, 'You do not have permission to do this');
    }
    next();
  };
}

module.exports = { auth, requireRole };
