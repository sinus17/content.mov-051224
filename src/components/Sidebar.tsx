import { Music2, Settings, ChevronDown, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        active ? "bg-surface text-text-primary" : "text-text-secondary hover:bg-surface/80"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-stone-dark border-r border-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-cream-light">outnow.mov</h1>
        <button className="p-1 hover:bg-surface rounded">
          <Plus className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="space-y-1">
        <SidebarItem
          icon={<Music2 className="w-4 h-4" />}
          label="Hot50 DE"
          href="/"
          active={location.pathname === '/'}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between px-2 py-1.5 text-text-secondary text-sm">
          <span className="font-medium">Workspaces</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Settings button with proper spacing from bottom */}
      <div className="mt-auto mb-16">
        <SidebarItem
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
          href="/settings"
          active={location.pathname === '/settings'}
        />
      </div>
    </div>
  );
}