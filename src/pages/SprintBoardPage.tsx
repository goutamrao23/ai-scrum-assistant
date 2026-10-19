import { useEffect, useMemo, useState } from 'react';
import {
  KanbanSquare,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Trophy,
  Users,
} from 'lucide-react';
import {
  type ManagedStory,
  type StoryStatus,
  loadStories,
  updateStory,
} from '@/data/stories';
import { type SprintPlan, loadSprints } from '@/data/sprints';

const COLUMNS: StoryStatus[] = ['To Do', 'In Progress', 'Testing', 'Done'];

const columnStyles: Record<StoryStatus, { header: string; bar: string; ring: string }> = {
  'To Do': { header: 'text-slate-600', bar: 'bg-slate-400', ring: 'ring-slate-200' },
  'In Progress': { header: 'text-amber-600', bar: 'bg-amber-400', ring: 'ring-amber-200' },
  Testing: { header: 'text-sky-600', bar: 'bg-sky-400', ring: 'ring-sky-200' },
  Done: { header: 'text-emerald-600', bar: 'bg-emerald-400', ring: 'ring-emerald-200' },
  Blocked: { header: 'text-rose-600', bar: 'bg-rose-400', ring: 'ring-rose-200' },
};

const priorityDot: Record<ManagedStory['priority'], string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-slate-300',
};

export default function SprintBoardPage() {
  const [sprints, setSprints] = useState<SprintPlan[]>([]);
  const [stories, setStories] = useState<ManagedStory[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  useEffect(() => {
    const s = loadSprints();
    setSprints(s);
    setStories(loadStories());
    if (s.length > 0) setSelectedSprintId(s[0].id);
  }, []);

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === selectedSprintId) ?? null,
    [sprints, selectedSprintId],
  );

  const boardStories = useMemo(() => {
    if (!selectedSprint) return [];
    return selectedSprint.storyIds
      .map((id) => stories.find((s) => s.id === id))
      .filter((s): s is ManagedStory => Boolean(s));
  }, [selectedSprint, stories]);

  const move = (storyId: string, direction: 1 | -1) => {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    const currentIdx = COLUMNS.indexOf(story.status as (typeof COLUMNS)[number]);
    if (currentIdx === -1) return;
    const nextIdx = currentIdx + direction;
    if (nextIdx < 0 || nextIdx >= COLUMNS.length) return;
    const nextStatus = COLUMNS[nextIdx];
    setStories((prev) => updateStory(prev, storyId, { status: nextStatus }));
  };

  const setStatus = (storyId: string, status: StoryStatus) => {
    setStories((prev) => updateStory(prev, storyId, { status }));
  };

  const grouped: Record<StoryStatus, ManagedStory[]> = {
    'To Do': [],
    'In Progress': [],
    Testing: [],
    Done: [],
    Blocked: [],
  };
  boardStories.forEach((s) => {
    const col = COLUMNS.includes(s.status as (typeof COLUMNS)[number])
      ? (s.status as (typeof COLUMNS)[number])
      : 'To Do';
    grouped[col].push(s);
  });

  const completedPoints = grouped.Done.reduce((sum, s) => sum + s.points, 0);
  const totalPoints = boardStories.reduce((sum, s) => sum + s.points, 0);

  if (sprints.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sprint Board</h2>
          <p className="text-sm text-slate-500">
            Track story progress across the sprint columns.
          </p>
        </div>
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <KanbanSquare size={26} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-700">No sprint saved yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Create a sprint in <span className="font-medium text-slate-700">Sprint Planning</span> first,
            then return here to view its board.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sprint Board</h2>
          <p className="text-sm text-slate-500">Move stories between columns to update their status.</p>
        </div>
        <select
          value={selectedSprintId}
          onChange={(e) => setSelectedSprintId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
        >
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {selectedSprint && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryStat
              icon={CalendarRange}
              label="Sprint dates"
              value={`${selectedSprint.startDate || '—'} → ${selectedSprint.endDate || '—'}`}
              sub={selectedSprint.goal || 'No goal set'}
            />
            <SummaryStat
              icon={Trophy}
              label="Completed points"
              value={`${completedPoints} pts`}
              sub={`${grouped.Done.length} of ${boardStories.length} stories done`}
            />
            <SummaryStat
              icon={Users}
              label="Capacity"
              value={`${totalPoints} / ${selectedSprint.capacity} pts`}
              sub={totalPoints > selectedSprint.capacity ? 'Over capacity' : 'Within capacity'}
              danger={totalPoints > selectedSprint.capacity}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div
                key={col}
                className={`rounded-xl bg-white shadow-sm ring-1 ${columnStyles[col].ring} flex flex-col`}
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${columnStyles[col].bar}`} />
                    <h3 className={`text-sm font-semibold ${columnStyles[col].header}`}>{col}</h3>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 rounded-full px-2 py-0.5">
                    {grouped[col].length}
                  </span>
                </div>
                <ul className="p-3 space-y-3 min-h-[120px] flex-1">
                  {grouped[col].length === 0 ? (
                    <li className="text-xs text-slate-300 text-center py-6">No stories</li>
                  ) : (
                    grouped[col].map((s) => {
                      const colIdx = COLUMNS.indexOf(col);
                      const canBack = colIdx > 0;
                      const canForward = colIdx < COLUMNS.length - 1;
                      return (
                        <li
                          key={s.id}
                          className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100 hover:ring-slate-200 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[11px] text-slate-400">{s.id}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[s.priority]}`} />
                              {s.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-800 leading-snug">{s.title}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500 truncate">{s.assignee}</span>
                            <span className="text-xs font-medium text-slate-600 bg-white rounded px-1.5 py-0.5 ring-1 ring-slate-200">
                              {s.points} pts
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-1">
                            <button
                              onClick={() => move(s.id, -1)}
                              disabled={!canBack}
                              className="p-1.5 rounded-md text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={`Move ${s.id} back`}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <select
                              value={s.status}
                              onChange={(e) => setStatus(s.id, e.target.value as StoryStatus)}
                              className="flex-1 text-xs rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                              {COLUMNS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => move(s.id, 1)}
                              disabled={!canForward}
                              className="p-1.5 rounded-md text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={`Move ${s.id} forward`}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">
            Status changes are saved to the User Stories backlog and persist after refresh.
          </p>
        </>
      )}
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
  icon: typeof CalendarRange;
  label: string;
  value: string;
  sub?: string;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${danger ? 'ring-rose-200' : 'ring-slate-100'}`}>
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={15} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`mt-1.5 text-base font-semibold ${danger ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
