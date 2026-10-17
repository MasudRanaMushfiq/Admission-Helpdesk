const DIGITS = /^\d{1,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function register(body) {
  const errors = {};
  const name = String(body.fullName || '');

  if (name.length < 3 || name.length > 100) errors.fullName = 'Name must be 3-100 characters';
  if (!DIGITS.test(body.rollNo || '')) errors.rollNo = 'Roll number must be digits only';
  if (!DIGITS.test(body.registrationNo || '')) errors.registrationNo = 'Registration number must be digits only';
  if (typeof body.password !== 'string' || body.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (body.password !== body.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  return errors;
}

function login(body) {
  const errors = {};

  if (body.type === 'student') {
    if (!body.rollNo) errors.rollNo = 'Roll number is required';
  } else if (body.type === 'admin') {
    if (!EMAIL.test(body.email || '')) errors.email = 'A valid email is required';
  } else {
    errors.type = 'Type must be student or admin';
  }
  if (!body.password) errors.password = 'Password is required';

  return errors;
}

module.exports = { register, login };
