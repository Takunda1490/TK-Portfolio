import { useState, useEffect } from 'react';
import { fetchProfile, fetchSocialLinks } from '../api';
import Skeleton from '../components/Skeleton';
import {
  SkeletonLine,
  SkeletonCircle,
  SkeletonBlock,
} from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prof, links] = await Promise.all([
          fetchProfile(),
          fetchSocialLinks(),
        ]);
        if (!cancelled) {
          setProfile(prof);
          setSocialLinks(links);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="home home-loading">
        <div className="home-content">
          <SkeletonCircle size={56} />
          <SkeletonLine width="40%" />
          <SkeletonLine width="70%" />
          <SkeletonBlock width="100%" height={60} />
          <div className="btn-box">
            <SkeletonBlock width="120px" height={40} />
            <SkeletonBlock width="120px" height={40} />
          </div>
        </div>
        <div className="home-sci">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} width="40px" height="40px" />
          ))}
        </div>
        <div className="home-imgHover">
          <div className="img-item">
            <SkeletonCircle size={300} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="home">
        <ErrorState message={error} />
      </section>
    );
  }

  return (
    <section className="home">
      <div className="home-content">
        <h1>
          Hi, I{' '}
          <span className="accent">{profile?.name || 'TK'}!</span>
        </h1>
        <h3>{profile?.title || 'Web Developer'}</h3>
        <p>{profile?.bio}</p>
        <div className="btn-box">
          <a href="#" className="btn-primary">Hire Me</a>
          <a href={profile?.resume_url || '#'} className="btn-outline" download>
            Download Resume
          </a>
        </div>
      </div>
      <div className="home-sci">
        {socialLinks.map((link) => (
          <a key={link.platform} href={link.url} aria-label={link.platform}>
            {link.icon && <span className="social-icon">{link.icon}</span>}
          </a>
        ))}
      </div>
      <div className="home-imgHover">
        <div className="img-item">
          <img
            src={profile?.avatar_url || '/images/profile3.jpg'}
            alt="Profile"
            className="profile-img"
          />
        </div>
      </div>
    </section>
  );
}

