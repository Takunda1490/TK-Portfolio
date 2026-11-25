import { imageKitUrl, normalizeTechStack } from '../api';

export default function ProjectCard({ project }) {
  const techStack = normalizeTechStack(project.tech_stack);
  const coverUrl = imageKitUrl(project.cover_image, 'w-600,h-400,c-fill');

  return (
    <article className="project-card">
      <div className="project-card-image">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={project.title}
            className="project-card-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-card-cover-placeholder" />
        )}
      </div>
      <div className="project-card-content">
        <h3 className="project-card-title">{project.title}</h3>
        <div className="project-card-tech">
          {techStack.map((tech) => (
            <span key={tech} className="tech-chip">
              {tech}
            </span>
          ))}
        </div>
        <div className="project-card-links">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link project-link-live"
              aria-label={`Live demo of ${project.title}`}
            >
              Live
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link project-link-repo"
              aria-label={`Repository of ${project.title}`}
            >
              Repo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
