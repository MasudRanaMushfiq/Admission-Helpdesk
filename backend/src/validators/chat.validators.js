const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

function sendMessage(body) {
  const errors = {};
  const content = typeof body.content === 'string' ? body.content : '';

  if (content.length < MIN_LENGTH || content.length > MAX_LENGTH) {
    errors.content = `Question must be ${MIN_LENGTH}-${MAX_LENGTH} characters`;
  }
  return errors;
}

module.exports = { sendMessage };
