export type ChecklistSection = 'dor' | 'dod';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  custom: boolean;
}

export interface DoRDoDState {
  dor: ChecklistItem[];
  dod: ChecklistItem[];
}

const STORAGE_KEY = 'scrum.dorDod.v1';

const uid = (): string =>
  `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const defaultDor: ChecklistItem[] = [
  { id: uid(), text: 'Story follows the "As a … I want … so that …" format', checked: false, custom: false },
  { id: uid(), text: 'Title is clear, concise, and action-oriented', checked: false, custom: false },
  { id: uid(), text: 'Acceptance criteria are written and testable', checked: false, custom: false },
  { id: uid(), text: 'Story points estimated by the team', checked: false, custom: false },
  { id: uid(), text: 'Priority assigned and ranked against backlog', checked: false, custom: false },
  { id: uid(), text: 'Dependencies identified and resolved or acknowledged', checked: false, custom: false },
  { id: uid(), text: 'Assignee confirmed or team capacity available', checked: false, custom: false },
];

const defaultDod: ChecklistItem[] = [
  { id: uid(), text: 'All acceptance criteria met and verified', checked: false, custom: false },
  { id: uid(), text: 'Unit and integration tests written and passing', checked: false, custom: false },
  { id: uid(), text: 'Code reviewed and approved by at least one peer', checked: false, custom: false },
  { id: uid(), text: 'No open critical or high-severity defects', checked: false, custom: false },
  { id: uid(), text: 'Documentation updated (technical and user-facing)', checked: false, custom: false },
  { id: uid(), text: 'Deployed to staging and validated in a production-like env', checked: false, custom: false },
  { id: uid(), text: 'Product Owner accepted the story', checked: false, custom: false },
];

export const defaultState = (): DoRDoDState => ({
  dor: defaultDor,
  dod: defaultDod,
});

export function loadState(): DoRDoDState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as DoRDoDState;
    if (!parsed || !Array.isArray(parsed.dor) || !Array.isArray(parsed.dod)) {
      return defaultState();
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state: DoRDoDState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function newItem(text: string): ChecklistItem {
  return { id: uid(), text, checked: false, custom: true };
}

export function completion(items: ChecklistItem[]): { done: number; total: number; pct: number } {
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}
