import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ListChecks,
  AlertTriangle,
} from 'lucide-react';
import {
  type ManagedStory,
  type StoryStatus,
  loadStories,
  createStory,
  updateStory,
  deleteStory,
  descriptionString,
} from '@/data/stories';
import StoryFormModal from '@/components/StoryFormModal';

const statusBadge: Record<StoryStatus, string> = {
  'To Do': 'bg-slate-100 text-slate-600 ring-slate-200',
  'In Progress': 'bg-amber-100 text-amber-700 ring-amber-200',
  Testing: 'bg-sky-100 text-sky-700 ring-sky-200',
  Done: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Blocked: 'bg-rose-100 text-rose-700 ring-rose-200',
};

const priorityDot: Record<ManagedStory['priority'], string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-slate-300',
};

export default function UserStoriesPage() {
  const [stories, setStories] = useState<ManagedStory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedStory | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StoryStatus>('All');
  const [confirmDelete, setConfirmDelete] = useState<ManagedStory | null>(null);

  useEffect(() => {
    setStories(loadStories());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stories.filter((s) => {
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.assignee.toLowerCase().includes(q) ||
        s.epic.toLowerCase().includes(q)
      );
    });
  }, [stories, query, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (story: ManagedStory) => {
    setEditing(story);
    setModalOpen(true);
  };

  const handleSubmit = (draft: Omit<ManagedStory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      setStories((prev) => updateStory(prev, editing.id, draft));
    } else {
      setStories((prev) => createStory(prev, draft));
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setStories((prev) => deleteStory(prev, id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User Stories</h2>
          <p className="text-sm text-slate-500">
            Create and manage backlog stories for the Core Banking program.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition"
        >
          <Plus size={16} /> New user story
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, ID, epic or assignee…"
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | StoryStatus)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="All">All statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Testing">Testing</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ListChecks size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">No stories found</p>
            <p className="text-xs text-slate-400">Try adjusting filters or create a new story.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Epic</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Pts</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{s.id}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 truncate">{s.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {descriptionString(s)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.epic}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${priorityDot[s.priority]}`} />
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.points}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.assignee}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusBadge[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(s)}
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
        {filtered.length} of {stories.length} stories · stored locally in your browser
      </p>

      <StoryFormModal
        open={modalOpen}
        initial={editing}
        existingTitles={stories.map((s) => s.title)}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Delete story?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{confirmDelete.id}</span> — {confirmDelete.title} will be permanently removed.
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
