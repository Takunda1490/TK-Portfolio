import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import {
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../api';

const INITIAL_FORM = { name: '', level: 0, category: 'Languages', order: 0 };

const CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Tools', 'Other'];

export default function AdminSkills() {
  const { showToast } = useToast();
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSkills()
      .then((data) => {
        if (!cancelled) setGrouped(data || {});
      })
      .catch(() => {
        if (!cancelled) showToast({ type: 'error', message: 'Failed to load skills.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const allSkills = useFlat(grouped);

  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
    setEditingId(null);
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name || '',
      level: skill.level || 0,
      category: skill.category || 'Other',
      order: skill.order || 0,
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
        name: form.name,
        level: Number(form.level) || 0,
        category: form.category,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateSkill(editingId, payload);
        showToast({ type: 'success', message: 'Skill updated.' });
      } else {
        await createSkill(payload);
        showToast({ type: 'success', message: 'Skill created.' });
      }
      setOpen(false);
      resetForm();
      await loadSkills();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save skill.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadSkills = () =>
    fetchSkills()
      .then((data) => setGrouped(data || {}))
      .catch(() => showToast({ type: 'error', message: 'Failed to reload skills.' }));

  const handleDelete = async (id) => {
    try {
      await deleteSkill(id);
      showToast({ type: 'success', message: 'Skill deleted.' });
      await loadSkills();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to delete skill.',
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
          <h2>Skills</h2>
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page admin-section admin-skills">
      <div className="container">
        <div className="admin-page-header">
          <h2>Skills</h2>
          <button type="button" className="btn-submit" onClick={handleAdd}>
            Add Skill
          </button>
        </div>

        <p className="projects-intro">
          Skills are grouped by category on the public About page.
        </p>

        <div className="skills-groups">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="skill-group">
              <h3 className="skill-group-title">{category}</h3>
              <div className="skill-list">
                {(items || []).map((skill) => (
                  <div
                    key={skill.id}
                    className="skill-list-item"
                  >
                    <div className="skill-list-info">
                      <span className="skill-list-name">{skill.name}</span>
                      <span className="skill-list-level">Level {skill.level}</span>
                    </div>
                    <div className="skill-list-actions">
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => handleEdit(skill)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-link btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(skill.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(items || []).length === 0 && (
                  <p style={{ fontSize: 13, opacity: 0.7 }}>No skills in this category.</p>
                )}
              </div>
            </div>
          ))}
          {allSkills.length === 0 && (
            <div className="empty-state">
              <p>No skills yet. Add your first skill.</p>
            </div>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete skill?</h3>
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
              <h2>{editingId ? 'Edit Skill' : 'Add Skill'}</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="name">Name <span className="required">*</span></label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="e.g. JavaScript"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={handleChange('category')}
                    disabled={submitting}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="level">Level (0-100)</label>
                  <input
                    id="level"
                    type="number"
                    min="0"
                    max="100"
                    value={form.level}
                    onChange={handleChange('level')}
                    placeholder="80"
                    disabled={submitting}
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
                    {submitting ? 'Saving…' : editingId ? 'Update Skill' : 'Create Skill'}
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

function useFlat(grouped) {
  const flat = [];
  for (const items of Object.values(grouped || {})) {
    flat.push(...(items || []));
  }
  return flat;
}
