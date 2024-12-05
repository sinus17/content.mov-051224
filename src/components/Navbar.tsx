import { Search, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="fixed top-0 right-0 left-64 bg-background border-b border-border z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="relative flex-1 max-w-2xl">
          <input
            type="text"
            placeholder="Search content ideas..."
            className="w-full px-4 py-1.5 bg-surface rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button className="px-3 py-1.5 bg-cream text-stone-dark rounded-lg text-sm flex items-center space-x-1 hover:bg-cream-dark transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>
    </nav>
  );
}