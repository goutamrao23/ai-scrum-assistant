import { sprint } from '@/data/sampleData';
import { TrendingUp } from 'lucide-react';

export default function SprintProgress() {
  const pct = Math.round((sprint.completedPoints / sprint.committedPoints) * 100);
  const dayPct = Math.round(((sprint.totalDays - sprint.daysRemaining) / sprint.totalDays) * 100);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Sprint Progress</h2>
          <p className="text-sm text-slate-500">{sprint.name}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
          <TrendingUp size={14} /> On track
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Goal:</span> {sprint.goal}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700">Story points completed</span>
            <span className="text-slate-500">
              {sprint.completedPoints} / {sprint.committedPoints} pts
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-blue-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700">Sprint timeline</span>
            <span className="text-slate-500">
              {sprint.daysRemaining} days left
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-violet-500 transition-all duration-700"
              style={{ width: `${dayPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs text-slate-400">Start</p>
          <p className="text-sm font-medium text-slate-700">{sprint.startDate}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">End</p>
          <p className="text-sm font-medium text-slate-700">{sprint.endDate}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Velocity</p>
          <p className="text-sm font-medium text-slate-700">42 pts / sprint</p>
        </div>
      </div>
    </div>
  );
}
