import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../lib/theme';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-surface-secondary hover:bg-surface/80 transition-colors"
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-text-primary" />
      ) : (
        <Sun className="w-4 h-4 text-text-primary" />
      )}
    </button>
  );
}