const DIGITS = /^\d{1,20}$/;

const isPositiveInt = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const lengthBetween = (value, min, max) => typeof value === 'string' && value.length >= min && value.length <= max;

function studentRecord(body) {
  const errors = {};
  if (!lengthBetween(body.fullName, 3, 100)) errors.fullName = 'Name must be 3-100 characters';
  if (!DIGITS.test(body.rollNo || '')) errors.rollNo = 'Roll number must be digits only';
  if (!DIGITS.test(body.registrationNo || '')) errors.registrationNo = 'Registration number must be digits only';
  return errors;
}

function category(body) {
  const errors = {};
  if (!lengthBetween(body.name, 2, 50)) errors.name = 'Name must be 2-50 characters';
  return errors;
}

function kbEntry(body) {
  const errors = {};
  if (!isPositiveInt(body.categoryId)) errors.categoryId = 'Please choose a category';
  if (!lengthBetween(body.question, 3, 255)) errors.question = 'Question must be 3-255 characters';
  if (!lengthBetween(body.answer, 1, 5000)) errors.answer = 'Answer must be 1-5000 characters';
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') errors.isActive = 'isActive must be true or false';
  return errors;
}

function inboxReply(body) {
  const errors = {};
  if (!lengthBetween(body.content, 1, 5000)) errors.content = 'Reply must be 1-5000 characters';
  if (body.saveToKb) {
    if (!isPositiveInt(body.categoryId)) errors.categoryId = 'Choose a category to save to the knowledge base';
    if (body.kbQuestion !== undefined && !lengthBetween(body.kbQuestion, 3, 255)) {
      errors.kbQuestion = 'Question must be 3-255 characters';
    }
  }
  return errors;
}

module.exports = { studentRecord, category, kbEntry, inboxReply };
