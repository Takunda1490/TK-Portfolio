import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastProvider } from './ToastContext';

export default function Layout() {
  return (
    <ToastProvider>
      <>
        <Navbar />
        <main className="page">
          <Outlet />
        </main>
        <Footer />
      </>
    </ToastProvider>
  );
}
