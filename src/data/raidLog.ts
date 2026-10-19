export type RaidType = 'Risk' | 'Assumption' | 'Issue' | 'Dependency';
export type RaidStatus = 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
export type RaidPriority = 'High' | 'Medium' | 'Low';

export interface RaidEntry {
  id: string;
  type: RaidType;
  title: string;
  description: string;
  owner: string;
  status: RaidStatus;
  priority: RaidPriority;
  dueDate: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'scrum.raidLog.v1';

export const RAID_TYPES: RaidType[] = ['Risk', 'Assumption', 'Issue', 'Dependency'];
export const RAID_STATUSES: RaidStatus[] = ['Open', 'In Progress', 'Mitigated', 'Closed'];
export const RAID_PRIORITIES: RaidPriority[] = ['High', 'Medium', 'Low'];

export const RAID_OWNERS = [
  'A. Okafor',
  'M. Silva',
  'R. Khan',
  'J. Novak',
  'L. Haddad',
  'Unassigned',
];

const uid = (): string =>
  `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const seed: RaidEntry[] = [
  {
    id: uid(),
    type: 'Risk',
    title: 'Core banking API rate limit may delay transfer confirmation',
    description:
      'The downstream core banking API enforces a 50 req/sec limit. Peak transfer windows could exceed this and delay confirmations.',
    owner: 'J. Novak',
    status: 'Open',
    priority: 'High',
    dueDate: '2026-10-24',
    createdAt: Date.now() - 7_000_000,
    updatedAt: Date.now() - 7_000_000,
  },
  {
    id: uid(),
    type: 'Assumption',
    title: 'Fraud-screen vendor will deliver sandbox by week 2',
    description:
      'Sprint plan assumes the fraud-screen vendor provisions the sandbox environment in time for integration testing.',
    owner: 'R. Khan',
    status: 'Open',
    priority: 'Medium',
    dueDate: '2026-10-21',
    createdAt: Date.now() - 6_000_000,
    updatedAt: Date.now() - 6_000_000,
  },
  {
    id: uid(),
    type: 'Issue',
    title: 'Reversal workflow blocked on legal sign-off',
    description:
      'The reversal workflow for failed debits cannot ship until legal signs off on the customer communication template.',
    owner: 'L. Haddad',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-10-22',
    createdAt: Date.now() - 5_000_000,
    updatedAt: Date.now() - 500_000,
  },
  {
    id: uid(),
    type: 'Dependency',
    title: 'FX rate feed availability during maintenance window',
    description:
      'Cross-border FX display depends on the treasury FX feed, which has a scheduled maintenance window overlapping sprint demo day.',
    owner: 'M. Silva',
    status: 'Open',
    priority: 'Low',
    dueDate: '2026-10-25',
    createdAt: Date.now() - 4_000_000,
    updatedAt: Date.now() - 4_000_000,
  },
];

export function loadRaid(): RaidEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as RaidEntry[];
    if (!Array.isArray(parsed)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

export function saveRaid(entries: RaidEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const emptyRaid = (): Omit<RaidEntry, 'id' | 'createdAt' | 'updatedAt'> => ({
  type: 'Risk',
  title: '',
  description: '',
  owner: 'Unassigned',
  status: 'Open',
  priority: 'Medium',
  dueDate: '',
});

export function createRaid(
  entries: RaidEntry[],
  draft: Omit<RaidEntry, 'id' | 'createdAt' | 'updatedAt'>,
): RaidEntry[] {
  const entry: RaidEntry = {
    ...draft,
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const next = [entry, ...entries];
  saveRaid(next);
  return next;
}

export function updateRaid(
  entries: RaidEntry[],
  id: string,
  patch: Partial<RaidEntry>,
): RaidEntry[] {
  const next = entries.map((e) =>
    e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e,
  );
  saveRaid(next);
  return next;
}

export function deleteRaid(entries: RaidEntry[], id: string): RaidEntry[] {
  const next = entries.filter((e) => e.id !== id);
  saveRaid(next);
  return next;
}
