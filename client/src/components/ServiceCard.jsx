export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <div className="service-icon">
        {service.icon}
      </div>
      <h3 className="service-title">{service.title}</h3>
      <p className="service-description">
        {service.description || 'No description provided.'}
      </p>
    </article>
  );
}
