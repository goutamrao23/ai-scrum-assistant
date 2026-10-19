import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldAlert,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  type RaidEntry,
  type RaidType,
  type RaidStatus,
  type RaidPriority,
  loadRaid,
  createRaid,
  updateRaid,
  deleteRaid,
  emptyRaid,
  RAID_TYPES,
  RAID_STATUSES,
  RAID_PRIORITIES,
  RAID_OWNERS,
} from '@/data/raidLog';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition';

const typeStyles: Record<RaidType, { ring: string; badge: string; icon: typeof ShieldAlert }> = {
  Risk: { ring: 'ring-rose-200', badge: 'bg-rose-50 text-rose-700 ring-rose-200', icon: ShieldAlert },
  Assumption: { ring: 'ring-sky-200', badge: 'bg-sky-50 text-sky-700 ring-sky-200', icon: AlertTriangle },
  Issue: { ring: 'ring-amber-200', badge: 'bg-amber-50 text-amber-700 ring-amber-200', icon: AlertTriangle },
  Dependency: { ring: 'bg-violet-200', badge: 'bg-violet-50 text-violet-700 ring-violet-200', icon: ShieldAlert },
};

const statusBadge: Record<RaidStatus, string> = {
  Open: 'bg-rose-100 text-rose-700 ring-rose-200',
  'In Progress': 'bg-amber-100 text-amber-700 ring-amber-200',
  Mitigated: 'bg-sky-100 text-sky-700 ring-sky-200',
  Closed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
};

const priorityDot: Record<RaidPriority, string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-slate-300',
};

export default function RaidLogPage() {
  const [entries, setEntries] = useState<RaidEntry[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | RaidType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RaidStatus>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RaidEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RaidEntry | null>(null);

  useEffect(() => {
    setEntries(loadRaid());
  }, []);

  const counts = useMemo(() => {
    const byType: Record<RaidType, number> = { Risk: 0, Assumption: 0, Issue: 0, Dependency: 0 };
    let open = 0;
    entries.forEach((e) => {
      byType[e.type] += 1;
      if (e.status !== 'Closed') open += 1;
    });
    return { byType, open };
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (typeFilter !== 'All' && e.type !== typeFilter) return false;
      if (statusFilter !== 'All' && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.owner.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    });
  }, [entries, query, typeFilter, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (entry: RaidEntry) => {
    setEditing(entry);
    setModalOpen(true);
  };

  const handleSubmit = (draft: Omit<RaidEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      setEntries((prev) => updateRaid(prev, editing.id, draft));
    } else {
      setEntries((prev) => createRaid(prev, draft));
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => deleteRaid(prev, id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">RAID Log</h2>
          <p className="text-sm text-slate-500">
            Track Risks, Assumptions, Issues, and Dependencies for the Core Banking program.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition"
        >
          <Plus size={16} /> New entry
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard label="Risks" value={counts.byType.Risk} tone="rose" />
        <SummaryCard label="Assumptions" value={counts.byType.Assumption} tone="sky" />
        <SummaryCard label="Issues" value={counts.byType.Issue} tone="amber" />
        <SummaryCard label="Dependencies" value={counts.byType.Dependency} tone="violet" />
        <SummaryCard label="Open items" value={counts.open} tone="slate" />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, owner or ID…"
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'All' | RaidType)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="All">All types</option>
            {RAID_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | RaidStatus)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="All">All statuses</option>
            {RAID_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShieldAlert size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">No entries found</p>
            <p className="text-xs text-slate-400">Try adjusting filters or add a new entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${typeStyles[e.type].badge}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <p className="font-medium text-slate-800 truncate">{e.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{e.description}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{e.owner}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${priorityDot[e.priority]}`} />
                        {e.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusBadge[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {e.dueDate || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => openEdit(e)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(e)}
                        className="inline-flex items-center gap-1 px-2 py-1 ml-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        {filtered.length} of {entries.length} entries · stored locally in your browser
      </p>

      {modalOpen && (
        <RaidFormModal
          initial={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Delete entry?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{confirmDelete.title}</span> will be permanently removed.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 rounded-lg bg-rose-600 text-sm font-medium text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'rose' | 'sky' | 'amber' | 'violet' | 'slate';
}) {
  const toneCls: Record<typeof tone, string> = {
    rose: 'text-rose-700 bg-rose-50 ring-rose-100',
    sky: 'text-sky-700 bg-sky-50 ring-sky-100',
    amber: 'text-amber-700 bg-amber-50 ring-amber-100',
    violet: 'text-violet-700 bg-violet-50 ring-violet-100',
    slate: 'text-slate-700 bg-slate-50 ring-slate-100',
  };
  return (
    <div className={`rounded-xl p-4 ring-1 ${toneCls[tone]}`}>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function RaidFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: RaidEntry | null;
  onClose: () => void;
  onSubmit: (draft: Omit<RaidEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [draft, setDraft] = useState<Omit<RaidEntry, 'id' | 'createdAt' | 'updatedAt'>>(
    initial
      ? {
          type: initial.type,
          title: initial.title,
          description: initial.description,
          owner: initial.owner,
          status: initial.status,
          priority: initial.priority,
          dueDate: initial.dueDate,
        }
      : emptyRaid(),
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = () => {
    if (!draft.title.trim()) {
      setError('Please enter a title.');
      return;
    }
    onSubmit(draft);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            {initial ? 'Edit entry' : 'New RAID entry'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type">
              <select
                value={draft.type}
                onChange={(e) => set('type', e.target.value as RaidType)}
                className={inputCls}
              >
                {RAID_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={draft.priority}
                onChange={(e) => set('priority', e.target.value as RaidPriority)}
                className={inputCls}
              >
                {RAID_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Title" required>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Core banking API rate limit may delay transfers"
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the risk, assumption, issue, or dependency…"
              className={inputCls + ' resize-y'}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Owner">
              <select
                value={draft.owner}
                onChange={(e) => set('owner', e.target.value)}
                className={inputCls}
              >
                {RAID_OWNERS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) => set('status', e.target.value as RaidStatus)}
                className={inputCls}
              >
                {RAID_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={draft.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            {initial ? 'Save changes' : 'Add entry'}
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
