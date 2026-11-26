import { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import { fetchMe } from '../api';

export default function AdminDashboard() {
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
        if (!cancelled) showToast({
          type: 'error',
          message: 'Session expired. Please log in again.',
          persistent: true,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  if (loading) {
    return (
      <section className="page admin-section">
        <div className="container">
          <h2>Dashboard</h2>
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="page admin-section">
      <div className="container">
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
