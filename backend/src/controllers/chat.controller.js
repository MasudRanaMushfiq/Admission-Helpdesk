const chatService = require('../services/chat.service');
const { sendOk } = require('../utils/helpers');

// Student id comes from the token only
async function getHistory(req, res) {
  const messages = await chatService.getHistory(req.user.id);
  sendOk(res, messages);
}

async function sendMessage(req, res) {
  const result = await chatService.askQuestion(req.user.id, req.body.content);
  sendOk(res, result, 201);
}

module.exports = { getHistory, sendMessage };
