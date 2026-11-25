import { useState, useEffect, useMemo } from 'react';
import { fetchProjects, normalizeTechStack } from '../api';
import ProjectCard from '../components/ProjectCard';
import Skeleton from '../components/Skeleton';
import { SkeletonBlock } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchProjects();
        if (!cancelled) {
          setProjects(data);
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

  // Build the unique list of tech stack values across all projects for filters.
  const allTech = useMemo(() => {
    const techs = new Set(['All']);
    for (const project of projects) {
      for (const tech of normalizeTechStack(project.tech_stack)) {
        techs.add(tech);
      }
    }
    return [...techs];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((p) =>
      normalizeTechStack(p.tech_stack).includes(activeFilter)
    );
  }, [projects, activeFilter]);

  if (loading) {
    return (
      <section className="page projects">
        <div className="container">
          <h2>Projects</h2>
          <div className="projects-grid projects-grid-loading">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="project-card project-card-skeleton">
                <div className="project-card-image">
                  <SkeletonBlock width="100%" height={240} />
                </div>
                <div className="project-card-content">
                  <SkeletonBlock width="60%" height={20} />
                  <div className="tech-stack-skeleton">
                    {[0, 1, 2].map((j) => (
                      <SkeletonBlock key={j} width="40%" height={16} />
                    ))}
                  </div>
                  <div className="project-card-links-loading">
                    <SkeletonBlock width="50px" height={28} />
                    <SkeletonBlock width="55px" height={28} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page projects">
        <div className="container">
          <h2>Projects</h2>
          <ErrorState message={error} />
        </div>
      </section>
    );
  }

  const visible = filteredProjects.length
    ? filteredProjects
    : projects.length
    ? []
    : null;

  return (
    <section className="page projects">
      <div className="container">
        <h2>Projects</h2>
        <p className="projects-intro">
          A selection of my work. Use the filters to narrow by tech stack.
        </p>

        <div className="project-filters">
          {allTech.map((tech) => (
            <button
              key={tech}
              type="button"
              className={`filter-chip ${activeFilter === tech ? 'active' : ''}`}
              onClick={() => setActiveFilter(tech)}
              aria-pressed={activeFilter === tech}
            >
              {tech}
            </button>
          ))}
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found.</p>
            {activeFilter !== 'All' && (
              <button
                type="button"
                className="btn-reset-filter"
                onClick={() => setActiveFilter('All')}
              >
                Show all projects
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">{visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}</div>
        )}
      </div>
    </section>
  );
}

