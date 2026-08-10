import type { TimelineBlock } from './types';

/**
 * Returns the ISO date (YYYY-MM-DD) for the given offset (in days) from the
 * Monday of the current week, so fixture blocks always land within "this
 * week" regardless of when the app is run (for Dashboard day/week view
 * testing).
 */
function currentWeekDateISO(dayOffset: number): string {
  const now = new Date();
  const dow = now.getDay(); // 0 = Sunday
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + mondayOffset + dayOffset,
  );
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// References real member ids from teamMembers.ts and project ids from
// projects.ts (task 2.1 fixtures).
export const mockTimelineBlocks: TimelineBlock[] = [
  {
    id: 'block-1',
    projectId: 'proj-mobile-app',
    memberId: 'member-alice',
    type: 'meeting',
    title: 'Sprint planning',
    date: currentWeekDateISO(0), // Monday
    time: '09:00',
    duration: 60,
  },
  {
    id: 'block-2',
    projectId: 'proj-mobile-app',
    memberId: 'member-priya',
    type: 'task',
    title: 'Draft wireframes',
    date: currentWeekDateISO(1), // Tuesday
    time: '11:30',
    duration: 120,
  },
  {
    id: 'block-3',
    projectId: 'proj-api-gateway',
    memberId: 'member-luca',
    type: 'deadline',
    title: 'Budget report due',
    date: currentWeekDateISO(2), // Wednesday
    time: '17:00',
    duration: 30,
    completed: false,
  },
  {
    id: 'block-4',
    memberId: 'member-nina',
    type: 'break',
    title: 'Lunch break',
    date: currentWeekDateISO(3), // Thursday
    time: '12:30',
    duration: 45,
  },
  {
    id: 'block-5',
    projectId: 'proj-design-system',
    memberId: 'member-carlos',
    type: 'meeting',
    title: 'Client check-in',
    date: currentWeekDateISO(4), // Friday
    time: '14:00',
    duration: 45,
  },
];
