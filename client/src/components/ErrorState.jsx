export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <p className="error-message">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
