import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import { fetchSettings, updateSettings } from '../api';

const FIELDS = [
  { key: 'seo_title', label: 'SEO Title', type: 'text', placeholder: 'TK Portfolio - Developer' },
  { key: 'seo_description', label: 'SEO Description', type: 'text', placeholder: 'Full-stack portfolio' },
  { key: 'site_tagline', label: 'Site Tagline', type: 'text', placeholder: 'Full-stack portfolio' },
  { key: 'theme_primary', label: 'Primary Color', type: 'color' },
  { key: 'theme_bg_dark', label: 'Background Dark', type: 'color' },
  { key: 'theme_bg_mid', label: 'Background Mid', type: 'color' },
  { key: 'theme_accent', label: 'Accent Color', type: 'color' },
  { key: 'smtp_display_host', label: 'SMTP Host (display)', type: 'text', placeholder: 'smtp.gmail.com' },
  { key: 'smtp_display_port', label: 'SMTP Port (display)', type: 'text', placeholder: '587' },
  { key: 'smtp_display_user', label: 'SMTP User (display)', type: 'text', placeholder: 'user@example.com' },
];

export default function AdminSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((data) => {
        if (!cancelled) setSettings(data || {});
      })
      .catch(() => {
        if (!cancelled) showToast({ type: 'error', message: 'Failed to load settings.' });
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleChange = (key) => (e) => {
    setSettings((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {};
      FIELDS.forEach((f) => {
        if (settings[f.key] !== undefined && settings[f.key] !== '') {
          payload[f.key] = settings[f.key];
        }
      });
      const updated = await updateSettings(payload);
      setSettings(updated || {});
      showToast({ type: 'success', message: 'Settings saved.' });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save settings.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page admin-section">
      <div className="container">
        <h2>Settings</h2>
        <p>Configure site metadata, theme colors, and display SMTP info.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="settings-grid">
            {FIELDS.map((field) => (
              <div key={field.key} className="form-group">
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === 'color' ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      id={field.key}
                      type="color"
                      value={settings[field.key] || '#00abf0'}
                      onChange={handleChange(field.key)}
                      disabled={submitting}
                    />
                    <input
                      type="text"
                      value={settings[field.key] || ''}
                      onChange={handleChange(field.key)}
                      placeholder={field.placeholder}
                      disabled={submitting}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  </div>
                ) : (
                  <input
                    id={field.key}
                    type={field.type}
                    value={settings[field.key] || ''}
                    onChange={handleChange(field.key)}
                    placeholder={field.placeholder}
                    disabled={submitting}
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>
    </section>
  );
}
