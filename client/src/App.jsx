import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/ToastContext';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Services from './pages/Services';
import Contact from './pages/Contact';
import LoginForm from './components/LoginForm';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminProjects from './pages/AdminProjects';
import AdminServices from './pages/AdminServices';
import AdminSkills from './pages/AdminSkills';
import AdminSocial from './pages/AdminSocial';
import AdminMessages from './pages/AdminMessages';
import AdminSettings from './pages/AdminSettings';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public site (shared layout) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="projects" element={<Projects />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Admin login (no layout shell) */}
          <Route path="/login" element={<LoginForm />} />

        {/* Protected admin routes */}
        <Route element={<RequireAuth />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="social" element={<AdminSocial />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}


