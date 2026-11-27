import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from '../api';

const INITIAL_FORM = { title: '', description: '', icon: '', order: 0 };

export default function AdminServices() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [reorderDragging, setReorderDragging] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((data) => {
        if (!cancelled) setServices(data || []);
      })
      .catch(() => {
        if (!cancelled) showToast({ type: 'error', message: 'Failed to load services.' });
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

  const handleEdit = (service) => {
    setEditingId(service.id);
    setForm({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || '',
      order: service.order || 0,
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
        title: form.title,
        description: form.description,
        icon: form.icon,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateService(editingId, payload);
        showToast({ type: 'success', message: 'Service updated.' });
      } else {
        await createService(payload);
        showToast({ type: 'success', message: 'Service created.' });
      }
      setOpen(false);
      resetForm();
      await loadServices();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save service.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadServices = () =>
    fetchServices()
      .then((data) => setServices(data || []))
      .catch(() => showToast({ type: 'error', message: 'Failed to reload services.' }));

  const handleDelete = async (id) => {
    try {
      await deleteService(id);
      showToast({ type: 'success', message: 'Service deleted.' });
      await loadServices();
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to delete service.',
        persistent: true,
      });
    } finally {
      setDeleteId(null);
    }
  };

  const onDragStart = (e, index) => {
    setReorderDragging(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e, targetIndex) => {
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) {
      setReorderDragging(null);
      return;
    }
    const next = [...services];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setServices(next);
    setReorderDragging(null);
    try {
      await reorderServices(next.map((s) => s.id));
      showToast({ type: 'success', message: 'Order saved.' });
    } catch (err) {
      await loadServices();
      showToast({ type: 'error', message: 'Failed to save order.', persistent: true });
    }
  };

  if (loading) {
    return (
      <section className="page admin-section">
        <div className="container">
          <h2>Services</h2>
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page admin-section admin-services">
      <div className="container">
        <div className="admin-page-header">
          <h2>Services</h2>
          <button type="button" className="btn-submit" onClick={handleAdd}>
            Add Service
          </button>
        </div>

        <p className="projects-intro">
          Drag rows to reorder. Services appear on the public services page.
        </p>

        <div className="project-list">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`project-list-item ${reorderDragging === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, index)}
            >
              <div className="project-list-cover">
                <span className="service-icon">{service.icon || '⚡'}</span>
              </div>
              <div className="project-list-info">
                <h3 className="project-list-title">{service.title}</h3>
                {service.description && (
                  <p className="project-list-slug">{service.description}</p>
                )}
              </div>
              <div className="project-list-actions">
                <button type="button" className="btn-link" onClick={() => handleEdit(service)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-link btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(service.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="empty-state">
              <p>No services yet. Add your first service.</p>
            </div>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete service?</h3>
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
              <h2>{editingId ? 'Edit Service' : 'Add Service'}</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="title">Title <span className="required">*</span></label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Service title"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange('description')}
                    placeholder="What you offer"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="icon">Icon (emoji or HTML entity)</label>
                  <input
                    id="icon"
                    type="text"
                    value={form.icon}
                    onChange={handleChange('icon')}
                    placeholder="e.g. ⚡"
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
                    {submitting ? 'Saving…' : editingId ? 'Update Service' : 'Create Service'}
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
