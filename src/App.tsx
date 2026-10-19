import { useState } from 'react';
import {
  Rocket,
  ListChecks,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import SprintProgress from '@/components/SprintProgress';
import RecentActivity from '@/components/RecentActivity';
import UserStoriesPage from '@/pages/UserStoriesPage';
import SprintPlanningPage from '@/pages/SprintPlanningPage';
import SprintBoardPage from '@/pages/SprintBoardPage';
import DoRDoDPage from '@/pages/DoRDoDPage';
import RaidLogPage from '@/pages/RaidLogPage';
import { sprint, userStories, risks } from '@/data/sampleData';

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const total = userStories.length;
  const completed = userStories.filter((s) => s.status === 'Done').length;
  const inProgress = userStories.filter((s) => s.status === 'In Progress').length;

  const topbar =
    active === 'stories'
      ? { title: 'User Stories', subtitle: 'Backlog management · Core Banking Program' }
      : active === 'planning'
        ? { title: 'Sprint Planning', subtitle: 'Capacity & sprint planning · Core Banking Program' }
        : active === 'board'
          ? { title: 'Sprint Board', subtitle: 'Sprint execution · Core Banking Program' }
          : active === 'dor-dod'
            ? { title: 'DoR / DoD', subtitle: 'Quality gates · Core Banking Program' }
            : active === 'raid'
              ? { title: 'RAID Log', subtitle: 'Risks, assumptions, issues & dependencies · Core Banking Program' }
              : { title: 'Dashboard', subtitle: 'Core Banking Program · Sprint 14' };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        active={active}
        onSelect={setActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setMenuOpen(true)} title={topbar.title} subtitle={topbar.subtitle} />

        <main className="flex-1 px-4 lg:px-8 py-6 space-y-6">
          {active === 'dashboard' ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
                <p className="text-sm text-slate-500">
                  Snapshot of the current sprint for the Core Banking program.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard
                  label="Current Sprint"
                  value="Sprint 14"
                  hint={`${sprint.daysRemaining} days remaining`}
                  icon={Rocket}
                  accent="blue"
                />
                <StatCard
                  label="Total Stories"
                  value={total}
                  hint="In current sprint"
                  icon={ListChecks}
                  accent="violet"
                />
                <StatCard
                  label="Completed"
                  value={completed}
                  hint="Marked Done"
                  icon={CheckCircle2}
                  accent="emerald"
                />
                <StatCard
                  label="In Progress"
                  value={inProgress}
                  hint="Being worked on"
                  icon={Loader2}
                  accent="amber"
                />
                <StatCard
                  label="Open Risks"
                  value={risks.length}
                  hint="Needs attention"
                  icon={ShieldAlert}
                  accent="rose"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SprintProgress />
                <RecentActivity />
              </div>
            </>
          ) : active === 'stories' ? (
            <UserStoriesPage />
          ) : active === 'planning' ? (
            <SprintPlanningPage />
          ) : active === 'board' ? (
            <SprintBoardPage />
          ) : active === 'dor-dod' ? (
            <DoRDoDPage />
          ) : active === 'raid' ? (
            <RaidLogPage />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ListChecks size={26} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-700">Coming soon</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                This module is part of the AI Scrum Assistant roadmap and will be built out in a later version.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
