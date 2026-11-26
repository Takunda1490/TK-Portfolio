import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  uploadToImageKit,
  normalizeTechStack,
} from '../api';

const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  tech_stack: [],
  live_url: '',
  repo_url: '',
  cover_image: '',
  published: true,
  order: 0,
};

export default function AdminProjects() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [reorderDragging, setReorderDragging] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((data) => {
        if (!cancelled) setProjects(data || []);
      })
      .catch(() => {
        if (!cancelled) showToast({ type: 'error', message: 'Failed to load projects.' });
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
    setCoverFile(null);
    setCoverPreview(null);
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || '',
      slug: project.slug || '',
      description: project.description || '',
      tech_stack: normalizeTechStack(project.tech_stack),
      live_url: project.live_url || '',
      repo_url: project.repo_url || '',
      cover_image: project.cover_image || '',
      published: project.published !== 0 && project.published !== false,
      order: project.order || 0,
    });
    setCoverPreview(project.cover_image || null);
    setOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleToggle = (key) => () => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTechChange = (e) => {
    setForm((prev) => ({ ...prev, tech_stack: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }));
  };

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, cover_image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        tech_stack: form.tech_stack,
        live_url: form.live_url,
        repo_url: form.repo_url,
        cover_image: form.cover_image,
        published: form.published ? 1 : 0,
        order: Number(form.order) || 0,
      };
      if (coverFile) {
        try {
          payload.cover_image = await uploadToImageKit(coverFile);
        } catch {
          // fall back to manually entered URL
        }
      }
      if (editingId) {
        await updateProject(editingId, payload);
        showToast({ type: 'success', message: 'Project updated.' });
      } else {
        await createProject(payload);
        showToast({ type: 'success', message: 'Project created.' });
      }
      setOpen(false);
      resetForm();
      await loadProjects();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save project.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadProjects = () =>
    fetchProjects()
      .then((data) => setProjects(data || []))
      .catch(() => showToast({ type: 'error', message: 'Failed to reload projects.' }));

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      showToast({ type: 'success', message: 'Project deleted.' });
      await loadProjects();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete project.', persistent: true });
    } finally {
      setDeleteId(null);
    }
  };

  // Drag-and-drop reorder
  const onDragStart = useCallback((e, index) => {
    setReorderDragging(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(async (e, targetIndex) => {
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) {
      setReorderDragging(null);
      return;
    }
    const next = [...projects];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setProjects(next);
    setReorderDragging(null);
    try {
      await reorderProjects(next.map((p) => p.id));
      showToast({ type: 'success', message: 'Order saved.' });
    } catch (err) {
      await loadProjects();
      showToast({ type: 'error', message: 'Failed to save order.', persistent: true });
    }
  }, [projects, showToast]);

  if (loading) {
    return (
      <section className="page admin-section">
        <div className="container">
          <h2>Projects</h2>
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page admin-section admin-projects">
      <div className="container">
        <div className="admin-page-header">
          <h2>Projects</h2>
          <button type="button" className="btn-submit" onClick={handleAdd}>
            Add Project
          </button>
        </div>

        <p className="projects-intro">
          Drag rows to reorder. Published projects appear on the public site.
        </p>

        <div className="project-list">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`project-list-item ${reorderDragging === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, index)}
            >
              <div className="project-list-cover">
                {project.cover_image ? (
                  <img src={project.cover_image} alt={project.title} className="project-list-thumb" />
                ) : (
                  <div className="project-list-thumb-placeholder" />
                )}
              </div>
              <div className="project-list-info">
                <h3 className="project-list-title">{project.title}</h3>
                <span className="project-list-slug">{project.slug}</span>
                <div className="project-list-tech">
                  {normalizeTechStack(project.tech_stack).map((t) => (
                    <span key={t} className="tech-chip">{t}</span>
                  ))}
                </div>
                <span className={`project-list-badge ${project.published ? 'published' : 'unpublished'}`}>
                  {project.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="project-list-actions">
                <button type="button" className="btn-link" onClick={() => handleEdit(project)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-link btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(project.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="empty-state">
              <p>No projects yet. Add your first project.</p>
            </div>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete project?</h3>
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
              <h2>{editingId ? 'Edit Project' : 'Add Project'}</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="title">Title <span className="required">*</span></label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Project title"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">Slug</label>
                  <input
                    id="slug"
                    type="text"
                    value={form.slug}
                    onChange={handleChange('slug')}
                    placeholder="auto-generated from title"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={handleChange('description')}
                    placeholder="A short description"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tech_stack">Tech Stack (comma-separated)</label>
                  <input
                    id="tech_stack"
                    type="text"
                    value={form.tech_stack.join(', ')}
                    onChange={handleTechChange}
                    placeholder="React, Node.js, Tailwind"
                    disabled={submitting}
                  />
                  <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    Separate tags with commas.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="live_url">Live URL</label>
                  <input
                    id="live_url"
                    type="url"
                    value={form.live_url}
                    onChange={handleChange('live_url')}
                    placeholder="https://example.com"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="repo_url">Repo URL</label>
                  <input
                    id="repo_url"
                    type="url"
                    value={form.repo_url}
                    onChange={handleChange('repo_url')}
                    placeholder="https://github.com/user/repo"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cover_image">Cover Image</label>
                  <div className="upload-field">
                    <input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFile}
                      disabled={submitting}
                    />
                    {coverPreview && (
                      <div className="avatar-preview">
                        <img src={coverPreview} alt="Cover preview" className="cover-preview" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={form.cover_image}
                    onChange={handleChange('cover_image')}
                    placeholder="ImageKit URL for cover image"
                    disabled={submitting}
                    style={{ marginTop: 8, width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={handleToggle('published')}
                      disabled={submitting}
                    />
                    Published
                  </label>
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
                    {submitting ? 'Saving…' : editingId ? 'Update Project' : 'Create Project'}
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
