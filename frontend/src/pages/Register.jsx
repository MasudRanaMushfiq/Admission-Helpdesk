import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage, fieldErrors } from '../api/client';
import { useToast } from '../components/Toast';

const EMPTY = { fullName: '', rollNo: '', registrationNo: '', password: '', confirmPassword: '' };
const DIGITS = /^\d+$/;

function validate(form) {
  const errs = {};
  const name = form.fullName.trim();
  if (name.length < 3 || name.length > 100) errs.fullName = 'Name must be 3-100 characters';
  if (!DIGITS.test(form.rollNo.trim())) errs.rollNo = 'Roll number must be digits only';
  if (!DIGITS.test(form.registrationNo.trim())) errs.registrationNo = 'Registration number must be digits only';
  if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
  if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  return errs;
}

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const field = (name, label, props = {}) => (
    <label className="field">
      {label}
      <input name={name} value={form[name]} onChange={update} {...props} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Student Registration</h1>
        <p className="muted">Use the same details as your official student record</p>

        {field('fullName', 'Full name', { autoComplete: 'name' })}
        {field('rollNo', 'Roll number', { inputMode: 'numeric' })}
        {field('registrationNo', 'Registration number', { inputMode: 'numeric' })}
        {field('password', 'Password', { type: 'password', autoComplete: 'new-password' })}
        {field('confirmPassword', 'Confirm password', { type: 'password', autoComplete: 'new-password' })}

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="muted center">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
