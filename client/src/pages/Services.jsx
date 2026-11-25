import { useState, useEffect } from 'react';
import { fetchServices } from '../api';
import Skeleton from '../components/Skeleton';
import { SkeletonBlock } from '../components/Skeleton';
import ServiceCard from '../components/ServiceCard';
import ErrorState from '../components/ErrorState';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchServices();
        if (!cancelled) {
          setServices(data);
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
      <section className="page services">
        <div className="container">
          <h2>Services</h2>
          <div className="services-grid services-grid-loading">
            {[0, 1, 2].map((i) => (
              <div key={i} className="service-card service-card-skeleton">
                <SkeletonBlock width="48px" height="48px" />
                <SkeletonBlock width="60%" height={20} />
                <SkeletonBlock width="100%" height={96} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page services">
        <div className="container">
          <h2>Services</h2>
          <ErrorState message={error} />
        </div>
      </section>
    );
  }

  return (
    <section className="page services">
      <div className="container">
        <h2>Services</h2>
        <p className="services-intro">
          Here is what I can help you with.
        </p>
        <div className="services-grid">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <div className="empty-state">
              <p>No services available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
