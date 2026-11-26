import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import {
  fetchProfile,
  updateProfile,
  uploadToImageKit,
} from '../api';

const INITIAL = {
  name: '',
  title: '',
  bio: '',
  avatar_url: '',
  resume_url: '',
};

export default function AdminProfile() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...INITIAL });
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (!cancelled && profile) {
          setForm({
            name: profile.name || '',
            title: profile.title || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || '',
            resume_url: profile.resume_url || '',
          });
          if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
        }
      })
      .catch(() => {
        if (!cancelled) showToast({ type: 'error', message: 'Failed to load profile.' });
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleFile = (kind) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (kind === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setResumeFile(file);
    }
    if (errors[kind === 'avatar' ? 'avatar_url' : 'resume_url']) {
      setErrors((prev) => ({ ...prev, [kind === 'avatar' ? 'avatar_url' : 'resume_url']: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.title.trim()) next.title = 'Title is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (avatarFile) {
        try {
          payload.avatar_url = await uploadToImageKit(avatarFile);
        } catch {
          // fall back to the URL entered manually
        }
      }
      if (resumeFile) {
        try {
          payload.resume_url = await uploadToImageKit(resumeFile);
        } catch {
          // fall back to the URL entered manually
        }
      }
      const updated = await updateProfile(payload);
      setForm({
        name: updated.name,
        title: updated.title,
        bio: updated.bio,
        avatar_url: updated.avatar_url,
        resume_url: updated.resume_url,
      });
      if (updated.avatar_url) setAvatarPreview(updated.avatar_url);
      setAvatarFile(null);
      setResumeFile(null);
      showToast({ type: 'success', message: 'Profile saved.' });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save profile.',
        persistent: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page admin-section">
      <div className="container">
        <h2>Profile</h2>
        <p>Edit your public profile details.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. TK"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={submitting}
            />
            {errors.name && <span id="name-error" className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Web Developer"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              disabled={submitting}
            />
            {errors.title && <span id="title-error" className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange('bio')}
              placeholder="A short bio about you."
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar (ImageKit)</label>
            <div className="upload-field">
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFile('avatar')}
                disabled={submitting}
              />
              {avatarPreview && (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
            </div>
            <input
              type="text"
              value={form.avatar_url}
              onChange={handleChange('avatar_url')}
              placeholder="ImageKit URL for avatar"
              disabled={submitting}
              style={{ marginTop: 8, width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume (ImageKit)</label>
            <div className="upload-field">
              <input
                id="resume"
                type="file"
                accept="application/pdf,application/msword,.pdf,.doc,.docx"
                onChange={handleFile('resume')}
                disabled={submitting}
              />
              {resumeFile && <span className="file-name">{resumeFile.name}</span>}
            </div>
            <input
              type="text"
              value={form.resume_url}
              onChange={handleChange('resume_url')}
              placeholder="ImageKit URL for resume"
              disabled={submitting}
              style={{ marginTop: 8, width: '100%' }}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </section>
  );
}
