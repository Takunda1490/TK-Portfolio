import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { fetchMe } from '../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) navigate('/login', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      showToast({
        type: 'success',
        message: 'Logged out.',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Logout failed.',
        persistent: true,
      });
    }
  };

  if (loading) {
    return (
      <section className="page">
        <div className="container">
          <h2>Admin Dashboard</h2>
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="page admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Welcome, {user.email}</h3>
            <p>
              Role: <strong>{user.role}</strong>
            </p>
          </div>
          <div className="dashboard-card">
            <h3>Manage</h3>
            <ul className="manage-list">
              <li>Projects</li>
              <li>Services</li>
              <li>Skills</li>
              <li>Social Links</li>
              <li>Messages</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
