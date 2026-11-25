import { useState, useEffect } from 'react';

export default function Skeleton({ children, loading = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!loading || !mounted) return children;

  return (
    <div className="skeleton">
      <span className="skeleton-pulse" />
    </div>
  );
}

export function SkeletonLine({ width = '60%', loading = true }) {
  if (!loading) return null;
  return (
    <div className="skeleton-line" style={{ width }}>
      <span className="skeleton-pulse" />
    </div>
  );
}

export function SkeletonCircle({ size = 40, loading = true }) {
  if (!loading) return null;
  return (
    <div className="skeleton-circle" style={{ width: size, height: size }}>
      <span className="skeleton-pulse" />
    </div>
  );
}

export function SkeletonBlock({ width = '100%', height = 16, loading = true }) {
  if (!loading) return null;
  return (
    <div
      className="skeleton-block"
      style={{ width, height }}
    >
      <span className="skeleton-pulse" />
    </div>
  );
}
