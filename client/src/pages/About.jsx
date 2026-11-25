import { useState, useEffect } from 'react';
import { fetchProfile, fetchSkills } from '../api';
import Skeleton from '../components/Skeleton';
import {
  SkeletonLine,
  SkeletonBlock,
} from '../components/Skeleton';
import SkillItem from '../components/SkillItem';
import ErrorState from '../components/ErrorState';

export default function About() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prof, skillsData] = await Promise.all([
          fetchProfile(),
          fetchSkills(),
        ]);
        if (!cancelled) {
          setProfile(prof);
          setSkills(skillsData);
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
      <section className="page about about-loading">
        <div className="container">
          <SkeletonLine width="30%" />
          <SkeletonLine width="60%" />
          <SkeletonBlock width="100%" height={120} />
          <div className="skills-loading">
            {Object.entries({ Frontend: [], Backend: [], Database: [] }).map(
              ([cat]) => (
                <div key={cat} className="skill-category-loading">
                  <SkeletonLine width="40%" />
                  {[0, 1, 2].map((i) => (
                    <SkeletonBlock key={i} width="60%" height={8} />
                  ))}
                </div>
              )
            )}
          </div>
          <SkeletonBlock width="200px" height={40} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page about">
        <div className="container">
          <ErrorState message={error} />
        </div>
      </section>
    );
  }

  const categories = Object.entries(skills || {});

  return (
    <section className="page about">
      <div className="container">
        <h2>About Me</h2>
        <p>{profile?.bio || "I'm TK, a web developer."}</p>

        {categories.length > 0 && (
          <div className="skills-section">
            <h3>Skills</h3>
            {categories.map(([category, items]) => (
              <div key={category} className="skill-category">
                <h4>{category}</h4>
                {items.map((skill) => (
                  <SkillItem key={skill.id} skill={skill} />
                ))}
              </div>
            ))}
          </div>
        )}

        {profile?.resume_url && (
          <a
            href={profile.resume_url}
            className="btn-resume"
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            📄 Download Resume
          </a>
        )}
      </div>
    </section>
  );
}

