import type { StoryPriority, StoryStatus } from './sampleData';

export type { StoryPriority, StoryStatus };

export type Epic =
  | 'Account Management'
  | 'Transfers & Payments'
  | 'Cards & Wallet'
  | 'Compliance & Audit'
  | 'Notifications'
  | 'Reporting & Analytics';

export interface AcceptanceCriterion {
  id: string;
  text: string;
}

export interface ManagedStory {
  id: string;
  title: string;
  epic: Epic;
  priority: StoryPriority;
  points: number;
  assignee: string;
  status: StoryStatus;
  role: string;
  want: string;
  benefit: string;
  acceptanceCriteria: AcceptanceCriterion[];
  createdAt: number;
  updatedAt: number;
}

export const EPICS: Epic[] = [
  'Account Management',
  'Transfers & Payments',
  'Cards & Wallet',
  'Compliance & Audit',
  'Notifications',
  'Reporting & Analytics',
];

export const PRIORITIES: StoryPriority[] = ['High', 'Medium', 'Low'];
export const STATUSES: StoryStatus[] = ['To Do', 'In Progress', 'Testing', 'Done', 'Blocked'];

export const TEAM = [
  'A. Okafor',
  'M. Silva',
  'R. Khan',
  'J. Novak',
  'L. Haddad',
  'Unassigned',
];

const STORAGE_KEY = 'scrum.stories.v1';

export const emptyStory = (): Omit<ManagedStory, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: '',
  epic: 'Transfers & Payments',
  priority: 'Medium',
  points: 3,
  assignee: 'Unassigned',
  status: 'To Do',
  role: '',
  want: '',
  benefit: '',
  acceptanceCriteria: [],
});

const uid = (): string =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const newCriterion = (text = ''): AcceptanceCriterion => ({ id: uid(), text });

const seedStories: ManagedStory[] = [
  {
    id: 'BANK-101',
    title: 'Instant interbank transfer initiation',
    epic: 'Transfers & Payments',
    priority: 'High',
    points: 8,
    assignee: 'A. Okafor',
    status: 'Done',
    role: 'retail customer',
    want: 'to initiate an instant interbank transfer from my account',
    benefit: 'I can move funds to other banks without waiting for settlement windows.',
    acceptanceCriteria: [
      newCriterion('Given a funded account, when the customer submits a transfer, then the funds debit immediately and display a confirmation reference.'),
      newCriterion('Given an invalid beneficiary code, when the customer submits, then the system rejects the request and shows a clear error.'),
    ],
    createdAt: Date.now() - 9_000_000,
    updatedAt: Date.now() - 9_000_000,
  },
  {
    id: 'BANK-109',
    title: 'Reversal workflow for failed debit',
    epic: 'Transfers & Payments',
    priority: 'High',
    points: 8,
    assignee: 'R. Khan',
    status: 'Blocked',
    role: 'operations analyst',
    want: 'to reverse a transfer whose debit failed downstream',
    benefit: 'customers are made whole without manual ledger entries.',
    acceptanceCriteria: [
      newCriterion('Given a failed debit event, when the analyst triggers a reversal, then the original amount is credited back within 60 seconds.'),
      newCriterion('Given a reversal is completed, when the ledger is queried, then a paired reversal entry is recorded with the original reference.'),
    ],
    createdAt: Date.now() - 8_000_000,
    updatedAt: Date.now() - 500_000,
  },
  {
    id: 'BANK-107',
    title: 'Transfer limits per account tier',
    epic: 'Account Management',
    priority: 'High',
    points: 5,
    assignee: 'Unassigned',
    status: 'To Do',
    role: 'compliance officer',
    want: 'daily transfer limits enforced by account tier',
    benefit: 'the bank stays within regulatory exposure thresholds.',
    acceptanceCriteria: [
      newCriterion('Given a Silver tier account, when a transfer exceeds 50,000, then the transfer is blocked and the customer sees the tier limit.'),
    ],
    createdAt: Date.now() - 4_000_000,
    updatedAt: Date.now() - 4_000_000,
  },
  {
    id: 'BANK-112',
    title: 'Regulatory reporting export',
    epic: 'Reporting & Analytics',
    priority: 'Medium',
    points: 5,
    assignee: 'J. Novak',
    status: 'In Progress',
    role: 'compliance officer',
    want: 'to export a monthly regulatory transfer report',
    benefit: 'submissions to the central bank are accurate and on time.',
    acceptanceCriteria: [
      newCriterion('Given the reporting period is closed, when the officer requests an export, then a CSV matching the regulator schema is generated.'),
    ],
    createdAt: Date.now() - 3_000_000,
    updatedAt: Date.now() - 200_000,
  },
];

export function loadStories(): ManagedStory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedStories;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ManagedStory[];
    if (!Array.isArray(parsed)) return seedStories;
    return parsed;
  } catch {
    return seedStories;
  }
}

export function saveStories(stories: ManagedStory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

export function nextStoryId(stories: ManagedStory[]): string {
  const nums = stories
    .map((s) => parseInt(s.id.replace(/^BANK-/, ''), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 100;
  return `BANK-${max + 1}`;
}

export function createStory(
  stories: ManagedStory[],
  draft: Omit<ManagedStory, 'id' | 'createdAt' | 'updatedAt'>,
): ManagedStory[] {
  const story: ManagedStory = {
    ...draft,
    id: nextStoryId(stories),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const next = [story, ...stories];
  saveStories(next);
  return next;
}

export function updateStory(
  stories: ManagedStory[],
  id: string,
  patch: Partial<ManagedStory>,
): ManagedStory[] {
  const next = stories.map((s) =>
    s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s,
  );
  saveStories(next);
  return next;
}

export function deleteStory(stories: ManagedStory[], id: string): ManagedStory[] {
  const next = stories.filter((s) => s.id !== id);
  saveStories(next);
  return next;
}

export function descriptionString(s: {
  role: string;
  want: string;
  benefit: string;
}): string {
  return `As a ${s.role || '[user]'}, I want ${s.want || '[feature]'}, so that ${s.benefit || '[benefit]'}.`;
}

export function suggestAcceptanceCriteria(
  s: { role: string; want: string; benefit: string },
): string[] {
  const want = s.want.trim().toLowerCase();
  const role = s.role.trim() || 'user';
  const suggestions: string[] = [];

  const baseGiven = `Given a valid ${role}`;
  const baseWhen = want
    ? `when the ${role} ${stripLeadingTo(want)}`
    : 'when the action is performed';

  suggestions.push(
    `${baseGiven}, ${baseWhen}, then the system completes the action successfully and confirms the result.`,
  );

  if (/notif|alert|email|sms|message/.test(want)) {
    suggestions.push(
      `Given the ${role} has a verified contact, when the event fires, then a notification is sent within 30 seconds and logged.`,
    );
  }
  if (/transfer|payment|debit|credit|deposit/.test(want)) {
    suggestions.push(
      `Given insufficient funds, when the ${role} submits the request, then the transaction is blocked and a clear error is shown.`,
    );
  }
  if (/limit|threshold|cap/.test(want)) {
    suggestions.push(
      `Given the configured limit is exceeded, when the request is attempted, then the request is rejected and the limit value is surfaced to the user.`,
    );
  }
  if (/export|report|statement|download/.test(want)) {
    suggestions.push(
      `Given the reporting period is closed, when the ${role} requests an export, then a file in the expected format is generated and made available for download.`,
    );
  }
  if (/revers|refund|cancel/.test(want)) {
    suggestions.push(
      `Given a completed original transaction, when a reversal is initiated, then the original amount is returned and a paired ledger entry is recorded.`,
    );
  }
  if (/authentic|login|password|otp|biometric/.test(want)) {
    suggestions.push(
      `Given unverified credentials, when the ${role} attempts access, then authentication fails and no protected data is exposed.`,
    );
  }

  suggestions.push(
    `Given the ${role} is unauthorized, when the action is attempted, then access is denied and the attempt is audited.`,
  );

  return suggestions;
}

function stripLeadingTo(text: string): string {
  return text.replace(/^to\s+/, '');
}
