import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CalendarRange,
  Target,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { loadStories, type ManagedStory } from '@/data/stories';
import {
  type SprintPlan,
  loadSprints,
  upsertSprint,
  deleteSprint,
  emptySprint,
  sprintDurationDays,
  plannedPoints,
} from '@/data/sprints';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition';

export default function SprintPlanningPage() {
  const [sprints, setSprints] = useState<SprintPlan[]>([]);
  const [stories, setStories] = useState<ManagedStory[]>([]);
  const [editing, setEditing] = useState<SprintPlan | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SprintPlan | null>(null);

  useEffect(() => {
    setSprints(loadSprints());
    setStories(loadStories());
  }, []);

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === selectedId) ?? null,
    [sprints, selectedId],
  );

  const startNew = () => {
    const s = emptySprint();
    setEditing(s);
  };

  const startEdit = (s: SprintPlan) => {
    setEditing({ ...s });
  };

  const handleSave = (sprint: SprintPlan) => {
    if (!sprint.name.trim()) return;
    setSprints((prev) => upsertSprint(prev, sprint));
    setEditing(null);
    setSelectedId(sprint.id);
  };

  const handleDelete = (id: string) => {
    setSprints((prev) => deleteSprint(prev, id));
    if (selectedId === id) setSelectedId(null);
    setConfirmDelete(null);
  };

  if (editing) {
    return (
      <SprintForm
        sprint={editing}
        stories={stories}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (selectedSprint) {
    return (
      <SprintSummary
        sprint={selectedSprint}
        stories={stories}
        onBack={() => setSelectedId(null)}
        onEdit={() => startEdit(selectedSprint)}
        onDelete={() => setConfirmDelete(selectedSprint)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sprint Planning</h2>
          <p className="text-sm text-slate-500">
            Plan sprints against team capacity using backlog stories.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition"
        >
          <Plus size={16} /> New sprint
        </button>
      </div>

      {sprints.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CalendarRange size={22} />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700">No sprints planned yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "New sprint" to define a goal, capacity, and pull stories from the backlog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sprints.map((s) => {
            const pts = plannedPoints(s.storyIds, stories);
            const over = pts > s.capacity;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="text-left rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-blue-200 transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {s.startDate || '—'} → {s.endDate || '—'}
                      {sprintDurationDays(s) > 0 && ` · ${sprintDurationDays(s)} days`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                      over
                        ? 'bg-rose-50 text-rose-700 ring-rose-200'
                        : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    }`}
                  >
                    {over ? 'Over capacity' : 'Within capacity'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{s.goal || 'No goal set.'}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {s.storyIds.length} stories · <span className="font-medium text-slate-700">{pts} pts</span>
                  </span>
                  <span className="text-slate-400">cap {s.capacity}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, (pts / Math.max(1, s.capacity)) * 100)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete sprint?"
          body={
            <span>
              <span className="font-medium text-slate-700">{confirmDelete.name}</span> will be permanently removed. Backlog stories are not affected.
            </span>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
        />
      )}
    </div>
  );
}

function SprintForm({
  sprint,
  stories,
  onSave,
  onCancel,
}: {
  sprint: SprintPlan;
  stories: ManagedStory[];
  onSave: (s: SprintPlan) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<SprintPlan>(sprint);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof SprintPlan>(key: K, value: SprintPlan[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleStory = (id: string) =>
    setDraft((d) => ({
      ...d,
      storyIds: d.storyIds.includes(id)
        ? d.storyIds.filter((x) => x !== id)
        : [...d.storyIds, id],
    }));

  const selectedStories = stories.filter((s) => draft.storyIds.includes(s.id));
  const availableStories = stories.filter((s) => !draft.storyIds.includes(s.id));
  const pts = plannedPoints(draft.storyIds, stories);
  const over = pts > draft.capacity;

  const submit = () => {
    if (!draft.name.trim()) {
      setError('Please enter a sprint name.');
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      setError('Please set both start and end dates.');
      return;
    }
    if (new Date(draft.endDate) < new Date(draft.startDate)) {
      setError('End date must be on or after the start date.');
      return;
    }
    onSave(draft);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {sprint.name ? 'Edit sprint' : 'New sprint'}
          </h2>
          <p className="text-sm text-slate-500">Define the sprint and pull stories from the backlog.</p>
        </div>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <X size={16} /> Cancel
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Sprint name" required>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Sprint 15 — Cards & Wallet"
              className={inputCls}
            />
          </Field>
          <Field label="Team capacity (points)">
            <input
              type="number"
              min={1}
              value={draft.capacity}
              onChange={(e) => set('capacity', Math.max(1, parseInt(e.target.value || '1', 10)))}
              className={inputCls}
            />
          </Field>
          <Field label="Start date" required>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => set('startDate', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="End date" required>
            <input
              type="date"
              value={draft.endDate}
              onChange={(e) => set('endDate', e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Sprint goal">
          <textarea
            rows={2}
            value={draft.goal}
            onChange={(e) => set('goal', e.target.value)}
            placeholder="e.g. Deliver card activation flow and wallet top-up with KYC verification."
            className={inputCls + ' resize-y'}
          />
        </Field>

        <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Capacity check</p>
            <span className="text-sm text-slate-500">
              <span className={`font-semibold ${over ? 'text-rose-600' : 'text-slate-800'}`}>{pts}</span> / {draft.capacity} pts
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200">
            <div
              className={`h-2.5 rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(100, (pts / Math.max(1, draft.capacity)) * 100)}%` }}
            />
          </div>
          {over && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertTriangle size={14} />
              Planned points exceed team capacity by {pts - draft.capacity}.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Backlog ({availableStories.length})</p>
            <span className="text-xs text-slate-400">Select to add</span>
          </div>
          <ul className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {availableStories.length === 0 ? (
              <li className="px-5 py-6 text-sm text-slate-400 text-center">All stories are in the sprint.</li>
            ) : (
              availableStories.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60">
                  <button
                    onClick={() => toggleStory(s.id)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0"
                    aria-label="Add to sprint"
                  >
                    <ArrowRight size={15} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{s.title}</p>
                    <p className="text-xs text-slate-400">{s.id} · {s.epic}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">{s.points} pts</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">In sprint ({selectedStories.length})</p>
            <span className="text-xs text-slate-400">Remove to send back</span>
          </div>
          <ul className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {selectedStories.length === 0 ? (
              <li className="px-5 py-6 text-sm text-slate-400 text-center">No stories selected yet.</li>
            ) : (
              selectedStories.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60">
                  <button
                    onClick={() => toggleStory(s.id)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 shrink-0"
                    aria-label="Remove from sprint"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{s.title}</p>
                    <p className="text-xs text-slate-400">{s.id} · {s.assignee}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">{s.points} pts</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          <Save size={15} /> Save sprint
        </button>
      </div>
    </div>
  );
}

function SprintSummary({
  sprint,
  stories,
  onBack,
  onEdit,
  onDelete,
}: {
  sprint: SprintPlan;
  stories: ManagedStory[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const selected = stories.filter((s) => sprint.storyIds.includes(s.id));
  const pts = plannedPoints(sprint.storyIds, stories);
  const over = pts > sprint.capacity;
  const remaining = Math.max(0, sprint.capacity - pts);
  const days = sprintDurationDays(sprint);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={15} /> All sprints
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">{sprint.name}</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryStat icon={CalendarRange} label="Duration" value={days > 0 ? `${days} days` : '—'} sub={`${sprint.startDate || '—'} → ${sprint.endDate || '—'}`} />
          <SummaryStat icon={Target} label="Planned points" value={`${pts} pts`} sub={`${sprint.storyIds.length} stories`} />
          <SummaryStat
            icon={Layers}
            label="Capacity"
            value={`${sprint.capacity} pts`}
            sub={over ? `Over by ${pts - sprint.capacity}` : `${remaining} pts remaining`}
            danger={over}
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sprint goal</p>
          <p className="mt-1 text-sm text-slate-700">{sprint.goal || 'No goal set.'}</p>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Planned vs capacity</p>
          <div className="h-3 w-full rounded-full bg-slate-100">
            <div
              className={`h-3 rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(100, (pts / Math.max(1, sprint.capacity)) * 100)}%` }}
            />
          </div>
          {over && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-rose-600">
              <AlertTriangle size={15} /> Warning: planned points exceed team capacity by {pts - sprint.capacity}.
            </p>
          )}
          {!over && pts > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 size={15} /> Within capacity — {remaining} points of headroom remaining.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Selected stories ({selected.length})</p>
        </div>
        {selected.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No stories in this sprint.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Epic</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selected.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{s.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.title}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.epic}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.assignee}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.status}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{s.points}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td colSpan={5} className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Total planned
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{pts}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
  danger,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  sub?: string;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-lg p-4 ring-1 ${danger ? 'bg-rose-50 ring-rose-100' : 'bg-slate-50 ring-slate-100'}`}>
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={15} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-1.5 text-lg font-semibold ${danger ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-rose-600 text-sm font-medium text-white hover:bg-rose-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
