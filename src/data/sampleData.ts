export type StoryStatus = 'Done' | 'Testing' | 'In Progress' | 'To Do' | 'Blocked';
export type StoryPriority = 'High' | 'Medium' | 'Low';

export interface UserStory {
  id: string;
  title: string;
  status: StoryStatus;
  priority: StoryPriority;
  points: number;
  assignee: string;
}

export interface SprintInfo {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  totalDays: number;
  committedPoints: number;
  completedPoints: number;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Mitigated' | 'Closed';
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: 'story' | 'sprint' | 'risk' | 'review' | 'comment';
}

export const sprint: SprintInfo = {
  name: 'Sprint 14 — Core Banking Transfers',
  goal: 'Deliver instant interbank transfer flow with audit logging and fraud-screen integration.',
  startDate: '2026-10-06',
  endDate: '2026-10-20',
  daysRemaining: 2,
  totalDays: 10,
  committedPoints: 48,
  completedPoints: 33,
};

export const userStories: UserStory[] = [
  { id: 'BANK-101', title: 'Instant interbank transfer initiation', status: 'Done', priority: 'High', points: 8, assignee: 'A. Okafor' },
  { id: 'BANK-102', title: 'Transfer confirmation receipt PDF', status: 'Done', priority: 'Medium', points: 5, assignee: 'M. Silva' },
  { id: 'BANK-103', title: 'Fraud-screen rule engine hook', status: 'Done', priority: 'High', points: 8, assignee: 'R. Khan' },
  { id: 'BANK-104', title: 'Audit log writer for transfers', status: 'In Progress', priority: 'High', points: 5, assignee: 'J. Novak' },
  { id: 'BANK-105', title: 'Beneficiary save & recall', status: 'In Progress', priority: 'Medium', points: 3, assignee: 'A. Okafor' },
  { id: 'BANK-106', title: 'Scheduled (dated) transfers', status: 'In Progress', priority: 'Medium', points: 5, assignee: 'L. Haddad' },
  { id: 'BANK-107', title: 'Transfer limits per account tier', status: 'To Do', priority: 'High', points: 5, assignee: 'Unassigned' },
  { id: 'BANK-108', title: 'FX rate display for cross-border', status: 'To Do', priority: 'Low', points: 3, assignee: 'Unassigned' },
  { id: 'BANK-109', title: 'Reversal workflow for failed debit', status: 'Blocked', priority: 'High', points: 8, assignee: 'R. Khan' },
  { id: 'BANK-110', title: 'SMS & email transfer notifications', status: 'Done', priority: 'Medium', points: 3, assignee: 'M. Silva' },
  { id: 'BANK-111', title: 'Branch teller transfer screen', status: 'To Do', priority: 'Low', points: 5, assignee: 'Unassigned' },
  { id: 'BANK-112', title: 'Regulatory reporting export', status: 'In Progress', priority: 'Medium', points: 5, assignee: 'J. Novak' },
];

export const risks: RiskItem[] = [
  { id: 'R-01', title: 'Core banking API rate limit may delay transfer confirmation', severity: 'High', status: 'Open' },
  { id: 'R-02', title: 'Fraud-screen vendor SLA pending signature', severity: 'Medium', status: 'Open' },
  { id: 'R-03', title: 'Audit log retention policy unclear with compliance', severity: 'High', status: 'Open' },
  { id: 'R-04', title: 'FX feed downtime during maintenance window', severity: 'Low', status: 'Open' },
  { id: 'R-05', title: 'Reversal workflow blocked on legal sign-off', severity: 'High', status: 'Open' },
];

export const recentActivity: ActivityItem[] = [
  { id: 'a1', actor: 'J. Novak', action: 'moved', target: 'BANK-104 to In Progress', time: '12 min ago', type: 'story' },
  { id: 'a2', actor: 'R. Khan', action: 'flagged a risk on', target: 'BANK-109 Reversal workflow', time: '48 min ago', type: 'risk' },
  { id: 'a3', actor: 'M. Silva', action: 'completed', target: 'BANK-110 SMS & email notifications', time: '2 hours ago', type: 'story' },
  { id: 'a4', actor: 'Sprint Planning', action: 'committed 48 points to', target: 'Sprint 14', time: 'Yesterday', type: 'sprint' },
  { id: 'a5', actor: 'A. Okafor', action: 'commented on', target: 'BANK-101 transfer initiation', time: 'Yesterday', type: 'comment' },
  { id: 'a6', actor: 'L. Haddad', action: 'started review for', target: 'BANK-106 Scheduled transfers', time: '2 days ago', type: 'review' },
];

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'stories', label: 'User Stories', icon: 'ListChecks' },
  { id: 'planning', label: 'Sprint Planning', icon: 'CalendarRange' },
  { id: 'board', label: 'Sprint Board', icon: 'KanbanSquare' },
  { id: 'raid', label: 'RAID Log', icon: 'ShieldAlert' },
  { id: 'dor-dod', label: 'DoR / DoD', icon: 'CheckCheck' },
  { id: 'retro', label: 'Retrospectives', icon: 'RefreshCw' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3' },
] as const;
