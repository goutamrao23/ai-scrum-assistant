import {
  LayoutDashboard,
  ListChecks,
  CalendarRange,
  KanbanSquare,
  ShieldAlert,
  CheckCheck,
  RefreshCw,
  BarChart3,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import { navItems } from '@/data/sampleData';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ListChecks,
  CalendarRange,
  KanbanSquare,
  ShieldAlert,
  CheckCheck,
  RefreshCw,
  BarChart3,
};

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ active, onSelect, open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 transform bg-slate-900 text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white">
            <GraduationCap size={20} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">AI Scrum Assistant</p>
            <p className="text-xs text-slate-400">Core Banking Program</p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
