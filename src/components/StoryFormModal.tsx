import { useEffect, useState } from 'react';
import { X, Plus, Sparkles, Wand2, Trash2, Save, RotateCcw } from 'lucide-react';
import {
  type ManagedStory,
  type AcceptanceCriterion,
  type Epic,
  EPICS,
  PRIORITIES,
  STATUSES,
  TEAM,
  emptyStory,
  newCriterion,
  descriptionString,
  suggestAcceptanceCriteria,
} from '@/data/stories';

interface StoryFormModalProps {
  open: boolean;
  initial?: ManagedStory | null;
  existingTitles: string[];
  onClose: () => void;
  onSubmit: (draft: Omit<ManagedStory, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

type Draft = Omit<ManagedStory, 'id' | 'createdAt' | 'updatedAt'>;

export default function StoryFormModal({
  open,
  initial,
  existingTitles,
  onClose,
  onSubmit,
}: StoryFormModalProps) {
  const [draft, setDraft] = useState<Draft>(emptyStory());
  const [error, setError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (initial) {
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial;
        setDraft({ ...rest, acceptanceCriteria: rest.acceptanceCriteria.map((c) => ({ ...c })) });
      } else {
        setDraft(emptyStory());
      }
      setError(null);
      setSuggested([]);
    }
  }, [open, initial]);

  if (!open) return null;

  const isEdit = Boolean(initial);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addCriterion = () =>
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: [...d.acceptanceCriteria, newCriterion()],
    }));

  const updateCriterion = (id: string, text: string) =>
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: d.acceptanceCriteria.map((c) =>
        c.id === id ? { ...c, text } : c,
      ),
    }));

  const removeCriterion = (id: string) =>
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: d.acceptanceCriteria.filter((c) => c.id !== id),
    }));

  const generateSuggestions = () => {
    const s = suggestAcceptanceCriteria({
      role: draft.role,
      want: draft.want,
      benefit: draft.benefit,
    });
    setSuggested(s);
  };

  const adoptSuggestion = (text: string) => {
    if (draft.acceptanceCriteria.some((c) => c.text === text)) return;
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: [...d.acceptanceCriteria, newCriterion(text)],
    }));
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      setError('Please enter a story title.');
      return;
    }
    const dup = existingTitles
      .filter((t) => t !== initial?.title)
      .map((t) => t.toLowerCase())
      .includes(draft.title.trim().toLowerCase());
    if (dup) {
      setError('A story with this title already exists.');
      return;
    }
    if (!draft.role.trim() || !draft.want.trim() || !draft.benefit.trim()) {
      setError('Please complete the As a / I want / so that description.');
      return;
    }
    const cleaned: Draft = {
      ...draft,
      title: draft.title.trim(),
      acceptanceCriteria: draft.acceptanceCriteria.filter((c) => c.text.trim()),
    };
    onSubmit(cleaned);
  };

  const reset = () => {
    setDraft(emptyStory());
    setSuggested([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-2xl my-8 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isEdit ? 'Edit user story' : 'New user story'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEdit ? initial?.id : 'Draft'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <Field label="Title" required>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Instant interbank transfer initiation"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Epic">
              <select
                value={draft.epic}
                onChange={(e) => set('epic', e.target.value as Epic)}
                className={inputCls}
              >
                {EPICS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={draft.priority}
                onChange={(e) => set('priority', e.target.value as Draft['priority'])}
                className={inputCls}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Story points">
              <input
                type="number"
                min={1}
                max={21}
                value={draft.points}
                onChange={(e) => set('points', Math.max(1, parseInt(e.target.value || '1', 10)))}
                className={inputCls}
              />
            </Field>
            <Field label="Assignee">
              <select
                value={draft.assignee}
                onChange={(e) => set('assignee', e.target.value)}
                className={inputCls}
              >
                {TEAM.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) => set('status', e.target.value as Draft['status'])}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-sm font-medium text-slate-700 mb-3">Story description</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 w-16 shrink-0">As a</span>
                <input
                  type="text"
                  value={draft.role}
                  onChange={(e) => set('role', e.target.value)}
                  placeholder="retail customer"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 w-16 shrink-0">I want</span>
                <input
                  type="text"
                  value={draft.want}
                  onChange={(e) => set('want', e.target.value)}
                  placeholder="to initiate an instant interbank transfer"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 w-16 shrink-0">so that</span>
                <input
                  type="text"
                  value={draft.benefit}
                  onChange={(e) => set('benefit', e.target.value)}
                  placeholder="funds reach the beneficiary immediately"
                  className={inputCls}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 italic">
              {descriptionString(draft)}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Acceptance criteria</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateSuggestions}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  <Wand2 size={14} /> Suggest Given/When/Then
                </button>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {suggested.length > 0 && (
              <div className="mb-3 rounded-lg bg-violet-50 p-3 ring-1 ring-violet-100">
                <p className="flex items-center gap-1.5 text-xs font-medium text-violet-700 mb-2">
                  <Sparkles size={13} /> Suggested criteria (rule-based)
                </p>
                <ul className="space-y-2">
                  {suggested.map((s, i) => (
                    <li key={i} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-violet-900 leading-relaxed">{s}</span>
                      <button
                        type="button"
                        onClick={() => adoptSuggestion(s)}
                        className="shrink-0 text-xs font-medium text-violet-700 underline hover:text-violet-900"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {draft.acceptanceCriteria.length === 0 && suggested.length === 0 && (
              <p className="text-xs text-slate-400 italic">
                No criteria yet. Add one manually or generate suggestions from the description.
              </p>
            )}

            <ul className="space-y-2">
              {draft.acceptanceCriteria.map((c: AcceptanceCriterion) => (
                <li key={c.id} className="flex items-start gap-2">
                  <textarea
                    value={c.text}
                    onChange={(e) => updateCriterion(c.id, e.target.value)}
                    rows={2}
                    placeholder="Given …, when …, then …"
                    className={inputCls + ' resize-y'}
                  />
                  <button
                    type="button"
                    onClick={() => removeCriterion(c.id)}
                    className="mt-1.5 p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                    aria-label="Remove criterion"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          {!isEdit ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <RotateCcw size={15} /> Reset
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
            >
              <Save size={15} /> {isEdit ? 'Save changes' : 'Save story'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition';

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
