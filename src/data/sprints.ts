export interface SprintPlan {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  capacity: number;
  storyIds: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'scrum.sprintPlans.v1';

const uid = (): string =>
  `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const emptySprint = (): SprintPlan => ({
  id: uid(),
  name: '',
  goal: '',
  startDate: '',
  endDate: '',
  capacity: 40,
  storyIds: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function loadSprints(): SprintPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SprintPlan[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveSprints(sprints: SprintPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sprints));
}

export function upsertSprint(
  sprints: SprintPlan[],
  sprint: SprintPlan,
): SprintPlan[] {
  const exists = sprints.some((s) => s.id === sprint.id);
  const next = exists
    ? sprints.map((s) =>
        s.id === sprint.id ? { ...sprint, updatedAt: Date.now() } : s,
      )
    : [{ ...sprint, createdAt: Date.now(), updatedAt: Date.now() }, ...sprints];
  saveSprints(next);
  return next;
}

export function deleteSprint(sprints: SprintPlan[], id: string): SprintPlan[] {
  const next = sprints.filter((s) => s.id !== id);
  saveSprints(next);
  return next;
}

export function sprintDurationDays(s: SprintPlan): number {
  if (!s.startDate || !s.endDate) return 0;
  const start = new Date(s.startDate).getTime();
  const end = new Date(s.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

export function plannedPoints(
  storyIds: string[],
  stories: { id: string; points: number }[],
): number {
  return storyIds.reduce((sum, id) => {
    const story = stories.find((s) => s.id === id);
    return sum + (story?.points ?? 0);
  }, 0);
}
