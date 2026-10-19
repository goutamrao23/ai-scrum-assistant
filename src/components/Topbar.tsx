import { Menu } from 'lucide-react';

interface TopbarProps {
  onMenu: () => void;
  title: string;
  subtitle: string;
}

export default function Topbar({ onMenu, title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 h-16 px-4 lg:px-8 bg-white/80 backdrop-blur border-b border-slate-100">
      <button
        onClick={onMenu}
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 truncate">{title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block truncate">{subtitle}</p>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">Sarah Mensah</p>
          <p className="text-xs text-slate-400">Scrum Master</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
          SM
        </div>
      </div>
    </header>
  );
}
