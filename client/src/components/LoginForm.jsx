import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { login } from '../api';

export default function LoginForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      showToast({
        type: 'success',
        message: 'Welcome back!',
        persistent: false,
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Login failed. Please try again.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page login-page">
      <div className="login-container">
        <div className="login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="admin@yourdomain.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={submitting}
              />
              {errors.email && (
                <span id="email-error" className="field-error">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={submitting}
              />
              {errors.password && (
                <span id="password-error" className="field-error">
                  {errors.password}
                </span>
              )}
            </div>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
