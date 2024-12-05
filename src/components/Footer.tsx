import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-stone-dark border-t border-border px-4 py-2">
      <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
        <Link to="/terms" className="hover:text-text-primary transition-colors">
          Terms of Service
        </Link>
        <span>•</span>
        <Link to="/privacy" className="hover:text-text-primary transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}