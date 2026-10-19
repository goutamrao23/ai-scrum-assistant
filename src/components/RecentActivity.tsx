import { recentActivity } from '@/data/sampleData';
import { FileText, ShieldAlert, CalendarRange, MessageSquare, CheckCircle2 } from 'lucide-react';

const typeIcon = {
  story: { icon: FileText, color: 'text-blue-600 bg-blue-50' },
  risk: { icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' },
  sprint: { icon: CalendarRange, color: 'text-violet-600 bg-violet-50' },
  review: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  comment: { icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
} as const;

export default function RecentActivity() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
      <p className="text-sm text-slate-500">Latest updates across the sprint</p>

      <ul className="mt-5 space-y-1">
        {recentActivity.map((item, idx) => {
          const { icon: Icon, color } = typeIcon[item.type];
          return (
            <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
              {idx < recentActivity.length - 1 && (
                <span className="absolute left-[18px] top-9 bottom-0 w-px bg-slate-100" />
              )}
              <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full ring-4 ring-white ${color}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">{item.actor}</span>{' '}
                  {item.action}{' '}
                  <span className="font-medium text-slate-900">{item.target}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
