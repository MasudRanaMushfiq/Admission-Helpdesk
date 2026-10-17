import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../context/AuthContext';
import { errorMessage, fieldErrors } from '../api/client';
import { useToast } from '../components/Toast';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [type, setType] = useState('student');
  const [form, setForm] = useState({ rollNo: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    const errs = {};
    if (type === 'student' && !form.rollNo.trim()) errs.rollNo = 'Roll number is required';
    if (type === 'admin' && !form.email.trim()) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const body = type === 'student'
        ? { type, rollNo: form.rollNo, password: form.password }
        : { type, email: form.email, password: form.password };
      const user = await login(body);
      navigate(homeFor(user), { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Admission Helpdesk</h1>
        <p className="muted">Log in to ask your admission questions</p>

        <div className="tabs">
          <button type="button" className={type === 'student' ? 'tab active' : 'tab'} onClick={() => { setType('student'); setErrors({}); }}>
            Student
          </button>
          <button type="button" className={type === 'admin' ? 'tab active' : 'tab'} onClick={() => { setType('admin'); setErrors({}); }}>
            Admin
          </button>
        </div>

        {type === 'student' ? (
          <label className="field">
            Roll number
            <input name="rollNo" value={form.rollNo} onChange={update} inputMode="numeric" autoComplete="username" />
            {errors.rollNo && <span className="field-error">{errors.rollNo}</span>}
          </label>
        ) : (
          <label className="field">
            Email
            <input name="email" type="email" value={form.email} onChange={update} autoComplete="username" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
        )}

        <label className="field">
          Password
          <input name="password" type="password" value={form.password} onChange={update} autoComplete="current-password" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {type === 'student' && (
          <p className="muted center">
            New student? <Link to="/register">Create an account</Link>
          </p>
        )}
      </form>
    </div>
  );
}
