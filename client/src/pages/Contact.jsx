import { useState } from 'react';
import { useToast } from '../components/ToastContext';
import { submitContact } from '../api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    body: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.body.trim()) next.body = 'Message is required.';
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
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        body: form.body.trim(),
      });
      setSubmitted(true);
      showToast({
        type: 'success',
        message: 'Thanks! Your message has been sent.',
      });
      setForm({ name: '', email: '', subject: '', body: '' });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to send message. Please try again.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="page contact">
        <div className="container contact-wrapper">
          <div className="contact-success">
            <h2>Message sent!</h2>
            <p>
              Thank you for reaching out. I'll get back to you soon.
            </p>
            <button
              type="button"
              className="btn-reset"
              onClick={() => setSubmitted(false)}
            >
              Send another message
            </button>
          </div>
          <aside className="contact-info">
            <h3>Other ways to connect</h3>
            <p>You can also reach me via email or social links in the footer.</p>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="page contact">
      <div className="container contact-wrapper">
        <div className="contact-form-container">
          <h2>Contact Me</h2>
          <p>Have a project in mind? Send me a message.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Your name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                disabled={submitting}
              />
              {errors.name && (
                <span id="name-error" className="field-error">
                  {errors.name}
                </span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
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
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange('subject')}
                placeholder="What is this about?"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="body">Message</label>
              <textarea
                id="body"
                name="body"
                value={form.body}
                onChange={handleChange('body')}
                placeholder="Tell me about your project..."
                rows={5}
                aria-invalid={!!errors.body}
                aria-describedby={errors.body ? 'body-error' : undefined}
                disabled={submitting}
              />
              {errors.body && (
                <span id="body-error" className="field-error">
                  {errors.body}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        <aside className="contact-info">
          <h3>Other ways to connect</h3>
          <p>
            You can also reach me via email or find my social links in the
            footer.
          </p>
        </aside>
      </div>
    </section>
  );
}
