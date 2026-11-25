export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-brand">TK Portfolio</span>
        <p className="footer-text">
          &copy; {new Date().getFullYear()} TK. Built with React + Vite.
        </p>
      </div>
    </footer>
  );
}
