import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, CheckCheck, ClipboardCheck } from 'lucide-react';
import {
  type ChecklistItem,
  type DoRDoDState,
  loadState,
  saveState,
  newItem,
  completion,
} from '@/data/dorDod';

export default function DoRDoDPage() {
  const [state, setState] = useState<DoRDoDState>({ dor: [], dod: [] });

  useEffect(() => {
    setState(loadState());
  }, []);

  const persist = (next: DoRDoDState) => {
    setState(next);
    saveState(next);
  };

  const toggle = (section: 'dor' | 'dod', id: string) =>
    persist({
      ...state,
      [section]: state[section].map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i,
      ),
    });

  const add = (section: 'dor' | 'dod', text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    persist({ ...state, [section]: [...state[section], newItem(trimmed)] });
  };

  const remove = (section: 'dor' | 'dod', id: string) =>
    persist({ ...state, [section]: state[section].filter((i) => i.id !== id) });

  const dorStats = useMemo(() => completion(state.dor), [state.dor]);
  const dodStats = useMemo(() => completion(state.dod), [state.dod]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Definition of Ready / Definition of Done</h2>
        <p className="text-sm text-slate-500">
          Shared quality gates for the team. Toggle items, add your own, and track readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChecklistCard
          section="dor"
          title="Definition of Ready"
          subtitle="A story is ready to be pulled into a sprint when these hold."
          icon={ClipboardCheck}
          accent="blue"
          items={state.dor}
          stats={dorStats}
          onToggle={toggle}
          onAdd={add}
          onRemove={remove}
        />
        <ChecklistCard
          section="dod"
          title="Definition of Done"
          subtitle="A story is done when these conditions are satisfied."
          icon={CheckCheck}
          accent="emerald"
          items={state.dod}
          stats={dodStats}
          onToggle={toggle}
          onAdd={add}
          onRemove={remove}
        />
      </div>

      <p className="text-xs text-slate-400">
        Changes are saved to your browser and restored after refresh.
      </p>
    </div>
  );
}

function ChecklistCard({
  section,
  title,
  subtitle,
  icon: Icon,
  accent,
  items,
  stats,
  onToggle,
  onAdd,
  onRemove,
}: {
  section: 'dor' | 'dod';
  title: string;
  subtitle: string;
  icon: typeof CheckCheck;
  accent: 'blue' | 'emerald';
  items: ChecklistItem[];
  stats: { done: number; total: number; pct: number };
  onToggle: (s: 'dor' | 'dod', id: string) => void;
  onAdd: (s: 'dor' | 'dod', text: string) => void;
  onRemove: (s: 'dor' | 'dod', id: string) => void;
}) {
  const [draft, setDraft] = useState('');

  const accentRing = accent === 'blue' ? 'ring-blue-100' : 'ring-emerald-100';
  const accentText = accent === 'blue' ? 'text-blue-600' : 'text-emerald-600';
  const accentBg = accent === 'blue' ? 'bg-blue-50' : 'bg-emerald-50';
  const accentBar = accent === 'blue' ? 'bg-blue-600' : 'bg-emerald-600';

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(section, draft);
    setDraft('');
  };

  return (
    <div className={`rounded-xl bg-white shadow-sm ring-1 ${accentRing} flex flex-col`}>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${accentBg} ${accentText} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${accentText} shrink-0`}>{stats.pct}%</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{stats.done} of {stats.total} complete</span>
            <span>{stats.total - stats.done} remaining</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className={`h-2 rounded-full transition-all ${accentBar}`}
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
      </div>

      <ul className="p-3 space-y-1 flex-1">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-sm text-slate-400 text-center">No items yet — add one below.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50/60"
            >
              <button
                onClick={() => onToggle(section, item.id)}
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                  item.checked
                    ? accentBar + ' text-white'
                    : 'border-2 border-slate-200 hover:border-slate-300 text-transparent'
                }`}
                aria-label={item.checked ? 'Mark as not done' : 'Mark as done'}
              >
                <CheckCheck size={13} />
              </button>
              <span
                className={`flex-1 text-sm leading-relaxed ${
                  item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}
              >
                {item.text}
              </span>
              {item.custom && (
                <button
                  onClick={() => onRemove(section, item.id)}
                  className="opacity-0 group-hover:opacity-100 transition p-1 rounded text-slate-400 hover:text-rose-600"
                  aria-label="Delete custom item"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      <div className="p-3 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="Add a custom item…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <button
            onClick={submit}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-sm font-medium text-white hover:bg-slate-900 transition"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
