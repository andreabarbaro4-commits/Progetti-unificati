import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { isTabActive } from '../../lib/tabs';
import { formatCountBadge } from '../../lib/badge';
import { OverviewTab } from './tabs/OverviewTab';
import { MilestonesTasksTab } from './tabs/MilestonesTasksTab';
import { TeamTab } from './tabs/TeamTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { AlertsTab } from './tabs/AlertsTab';
import { EconomicsTab } from './tabs/EconomicsTab';
import type { Project, Alert, Economics, Document, TeamMember } from '../../mock/fixtures/types';

/**
 * Project Detail page — renders a tabbed view for a single project.
 *
 * Req 21.1: 5 fixed tabs (Overview, Milestones & Tasks, Team, Documents, Alerts).
 * Req 21.2: Conditional Economics tab immediately after Overview when project has economics data.
 * Req 21.3: Single-panel visibility via `isTabActive`.
 * Req 21.6: Overview tab is active by default on mount.
 */
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch all projects and find the one matching the route param.
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects'),
  });

  const project = useMemo(
    () => projects?.find((p) => p.id === id) ?? null,
    [projects, id],
  );

  // Fetch economics data for this project.
  const { data: economics } = useQuery({
    queryKey: ['project-economics', id],
    queryFn: () => apiClient.get<Economics | null>(`/projects/${id}/economics`),
    enabled: !!id,
  });

  // Fetch alerts for the badge count on the Alerts tab label.
  const { data: allAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get<Alert[]>('/alerts'),
  });

  // Fetch documents for the Overview tab.
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => apiClient.get<Document[]>('/documents'),
  });

  // Fetch team members for the Overview tab.
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  });

  const activeAlerts = useMemo(
    () =>
      allAlerts?.filter(
        (a) => a.projectId === id && !a.dismissed && !a.resolved,
      ) ?? [],
    [allAlerts, id],
  );

  const alertBadge = formatCountBadge(activeAlerts.length);

  // Determine whether the Economics tab should be shown (Req 21.2).
  const hasEconomics = economics != null && economics.id != null;

  // Build the tab list dynamically: 5 fixed + optional Economics after Overview.
  type TabDef = { key: string; label: string; badge?: string | null };

  const tabs: TabDef[] = useMemo(() => {
    const fixed: TabDef[] = [
      { key: 'overview', label: 'Overview' },
      { key: 'milestones-tasks', label: 'Milestones & Tasks' },
      { key: 'team', label: 'Team' },
      { key: 'documents', label: 'Documents' },
      { key: 'alerts', label: 'Alerts', badge: alertBadge },
    ];

    if (hasEconomics) {
      // Insert Economics immediately after Overview (index 0 → insert at 1).
      fixed.splice(1, 0, { key: 'economics', label: 'Economics' });
    }

    return fixed;
  }, [hasEconomics, alertBadge]);

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Loading project…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Project header */}
      <h1 className="text-xl font-semibold">{project.name}</h1>

      {/* Tab strip */}
      <div
        className="flex gap-1 overflow-x-auto border-b border-gray-200"
        role="tablist"
        aria-label="Project detail tabs"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isTabActive(selectedTab, index)}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
              isTabActive(selectedTab, index)
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab(index)}
          >
            {tab.label}
            {tab.badge && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab panels — exactly one visible at a time (Req 21.3) */}
      {tabs.map((tab, index) => (
        <div
          key={tab.key}
          id={`panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.key}`}
          hidden={!isTabActive(selectedTab, index)}
        >
          {isTabActive(selectedTab, index) && (
            <TabContent
              tabKey={tab.key}
              project={project}
              economics={economics}
              documents={documents}
              teamMembers={teamMembers}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Routes tab keys to their respective panel content.
 */
function TabContent({
  tabKey,
  project,
  economics,
  documents,
  teamMembers,
}: {
  tabKey: string;
  project: Project;
  economics?: Economics | null;
  documents: Document[];
  teamMembers: TeamMember[];
}) {
  // Filter documents to this project for the OverviewTab.
  const projectDocuments = useMemo(
    () => documents.filter((d) => d.projectId === project.id),
    [documents, project.id],
  );

  // Filter team members to this project for the OverviewTab.
  const projectMembers = useMemo(
    () => teamMembers.filter((m) => project.members.includes(m.id)),
    [teamMembers, project.members],
  );

  switch (tabKey) {
    case 'overview':
      return (
        <OverviewTab
          project={project}
          documents={projectDocuments}
          economics={economics ?? undefined}
          members={projectMembers}
        />
      );
    case 'economics':
      return <EconomicsTab projectId={project.id} />;
    case 'milestones-tasks':
      return <MilestonesTasksTab projectId={project.id} />;
    case 'team':
      return <TeamTab project={project} />;
    case 'documents':
      return <DocumentsTab projectId={project.id} />;
    case 'alerts':
      return <AlertsTab projectId={project.id} />;
    default:
      return null;
  }
}
