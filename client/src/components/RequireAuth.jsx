import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { fetchMe } from '../api';
import { SkeletonBlock } from './Skeleton';

export default function RequireAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          if (!me) navigate('/login', { replace: true });
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          navigate('/login', { replace: true });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (checking) {
    return (
      <section className="page">
        <div className="container">
          <SkeletonBlock width="40%" height={20} />
          <SkeletonBlock width="100%" height={120} />
        </div>
      </section>
    );
  }

  if (!user) return null;

  return <Outlet />;
}
