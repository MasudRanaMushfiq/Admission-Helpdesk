const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const { sendOk } = require('../utils/helpers');

async function register(req, res) {
  await authService.register(req.body);
  sendOk(res, { message: 'Registration successful, you can log in now' }, 201);
}

async function login(req, res) {
  const result = await authService.login(req.body);
  sendOk(res, result);
}

async function me(req, res) {
  const profile = await authService.getProfile(req.user.id);
  sendOk(res, profile);
}

async function logout(req, res) {
  await tokenService.deleteToken(req.token);
  sendOk(res, { message: 'Logged out' });
}

module.exports = { register, login, me, logout };
