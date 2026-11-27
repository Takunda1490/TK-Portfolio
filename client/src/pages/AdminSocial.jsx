import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import {
  fetchSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../api';

const ICONS = [
  'github', 'linkedin', 'twitter', 'instagram', 'facebook', 'youtube',
  'dribbble', 'behance', 'stack-overflow', 'codepen', 'gitlab', 'email',
  'website',
];

const INITIAL_FORM = { platform: '', url: '', icon: 'github', order: 0 };

export default function AdminSocial() {
  const { showToast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSocialLinks()
      .then((data) => {
        if (!cancelled) setLinks(data || []);
      })
      .catch(() => {
        if (!cancelled) showToast({ type: 'error', message: 'Failed to load social links.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
    setEditingId(null);
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setForm({
      platform: link.platform || '',
      url: link.url || '',
      icon: link.icon || 'github',
      order: link.order || 0,
    });
    setOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        platform: form.platform,
        url: form.url,
        icon: form.icon,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateSocialLink(editingId, payload);
        showToast({ type: 'success', message: 'Social link updated.' });
      } else {
        await createSocialLink(payload);
        showToast({ type: 'success', message: 'Social link created.' });
      }
      setOpen(false);
      resetForm();
      await loadLinks();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save social link.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadLinks = () =>
    fetchSocialLinks()
      .then((data) => setLinks(data || []))
      .catch(() => showToast({ type: 'error', message: 'Failed to reload social links.' }));

  const handleDelete = async (id) => {
    try {
      await deleteSocialLink(id);
      showToast({ type: 'success', message: 'Social link deleted.' });
      await loadLinks();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to delete social link.',
        persistent: true,
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <section className="page admin-section">
        <div className="container">
          <h2>Social Links</h2>
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page admin-section admin-social">
      <div className="container">
        <div className="admin-page-header">
          <h2>Social Links</h2>
          <button type="button" className="btn-submit" onClick={handleAdd}>
            Add Social Link
          </button>
        </div>

        <p className="projects-intro">
          Social links appear in the footer and contact section.
        </p>

        <div className="project-list">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`project-list-item`}
            >
              <div className="project-list-cover">
                <span className="service-icon">{iconLabel(link.icon)}</span>
              </div>
              <div className="project-list-info">
                <h3 className="project-list-title">{link.platform}</h3>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-list-slug"
                >
                  {link.url}
                </a>
              </div>
              <div className="project-list-actions">
                <button type="button" className="btn-link" onClick={() => handleEdit(link)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-link btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(link.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {links.length === 0 && (
            <div className="empty-state">
              <p>No social links yet. Add your first link.</p>
            </div>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete social link?</h3>
              <p>This cannot be undone.</p>
              <div className="modal-actions">
                <button type="button" className="btn-link" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button type="button" className="btn-submit btn-delete" onClick={() => handleDelete(deleteId)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {open && (
          <div className="modal-overlay" onClick={() => setOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingId ? 'Edit Social Link' : 'Add Social Link'}</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="platform">Platform <span className="required">*</span></label>
                  <input
                    id="platform"
                    type="text"
                    value={form.platform}
                    onChange={handleChange('platform')}
                    placeholder="e.g. GitHub"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">URL <span className="required">*</span></label>
                  <input
                    id="url"
                    type="url"
                    value={form.url}
                    onChange={handleChange('url')}
                    placeholder="https://github.com/username"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="icon">Icon</label>
                  <div className="icon-picker">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-chip ${form.icon === icon ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, icon }))}
                        aria-pressed={form.icon === icon}
                      >
                        {iconLabel(icon)}
                      </button>
                    ))}
                  </div>
                  <input
                    id="icon"
                    type="hidden"
                    value={form.icon}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="order">Order</label>
                  <input
                    id="order"
                    type="number"
                    value={form.order}
                    onChange={handleChange('order')}
                    placeholder="0"
                    disabled={submitting}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-link" onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Saving…' : editingId ? 'Update Social Link' : 'Create Social Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function iconLabel(icon) {
  const map = {
    github: '🐙',
    linkedin: '💼',
    twitter: '𝕏',
    instagram: '📷',
    facebook: 'f',
    youtube: '▶️',
    'stack-overflow': '➕',
    codepen: '🖊️',
    gitlab: '🦊',
    email: '✉️',
    website: '🌐',
  };
  return map[icon] || icon;
}
