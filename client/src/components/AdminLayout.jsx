import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './ToastContext';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/profile', label: 'Profile' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/skills', label: 'Skills' },
  { to: '/admin/social', label: 'Social' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/settings', label: 'Settings' },
];

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/profile': 'Profile',
  '/admin/projects': 'Projects',
  '/admin/services': 'Services',
  '/admin/skills': 'Skills',
  '/admin/social': 'Social Links',
  '/admin/messages': 'Messages',
  '/admin/settings': 'Settings',
};

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      showToast({ type: 'success', message: 'Logged out.' });
      navigate('/login', { replace: true });
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Logout failed.',
        persistent: true,
      });
    }
  };

  const title = TITLES[location.pathname] || 'Admin';

  const close = () => setOpen(false);

  return (
    <section className="admin-layout">
      {open && (
        <div className="admin-overlay" onClick={close} />
      )}

      <button
        className="menu-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
        aria-expanded={open}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <NavLink to="/admin/dashboard" className="brand" end>
            TK Admin
          </NavLink>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  end={item.to === '/admin/dashboard'}
                  onClick={close}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <h1 className="admin-title">{title}</h1>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </section>
  );
}
