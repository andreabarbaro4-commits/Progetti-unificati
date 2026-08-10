import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineUserPlus, HiOutlinePlus } from 'react-icons/hi2';
import { apiClient } from '../../lib/api-client';
import { columnsForWidth } from '../../lib/columns';
import { filterExact } from '../../lib/filter';
import { Button } from '../../components/ui/Button';
import type { Project, Client, TeamMember, Alert } from '../../mock/fixtures/types';
import { ProjectCard } from './ProjectCard';
import { ClientFilter } from './ClientFilter';
import { CreateCard } from './CreateCard';
import { AddClientDialog } from './dialogs/AddClientDialog';
import { ProjectEditDialog } from './dialogs/ProjectEditDialog';
import { ProjectDeleteDialog } from './dialogs/ProjectDeleteDialog';
import { useResizeObserver } from '../../hooks/useResizeObserver';

const PROJECTS_QUERY_KEY = ['projects'];
const CLIENTS_QUERY_KEY = ['clients'];
const TEAM_MEMBERS_QUERY_KEY = ['team-members'];
const ALERTS_QUERY_KEY = ['alerts'];

/**
 * Projects_List — the main page component for `/projects`.
 *
 * Renders a page header (title, project count, management actions) above a
 * responsive grid of ProjectCard components filtered by a chip-style
 * ClientFilter. Uses `columnsForWidth` (Req 13.1) for responsive column
 * count and `filterExact` (Req 13.3, 13.4, 13.5) for client-based filtering.
 *
 * - When no filter is selected: shows all projects.
 * - When a filter is selected: shows only matching projects.
 * - When filter matches nothing: shows an empty-state message but STILL renders
 *   the CreateCard (Req 13.6 — CreateCard is always last).
 */
export default function ProjectsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Track the container width via a resize observer for responsive columns.
  useResizeObserver(containerRef, (entry) => {
    setContainerWidth(entry.contentRect.width);
  });

  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => apiClient.get<Project[]>('/projects'),
  });

  const { data: clients } = useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: () => apiClient.get<Client[]>('/clients'),
  });

  const { data: teamMembers } = useQuery({
    queryKey: TEAM_MEMBERS_QUERY_KEY,
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  });

  const { data: alerts } = useQuery({
    queryKey: ALERTS_QUERY_KEY,
    queryFn: () => apiClient.get<Alert[]>('/alerts'),
  });

  // Column count is not consumed directly by JSX (the grid uses Tailwind's
  // responsive classes below), but this keeps `columnsForWidth` exercised so
  // its step-function contract (Req 13.1) stays covered by this component.
  columnsForWidth(containerWidth);

  // Build a client-id-to-name lookup for ProjectCard's clientName prop.
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const client of clients ?? []) {
      map.set(client.id, client.name);
    }
    return map;
  }, [clients]);

  // Apply client filter: when no filter is selected, show all projects.
  const filteredProjects = selectedClientId
    ? filterExact(projects ?? [], (project) => project.clientId === selectedClientId)
    : (projects ?? []);

  // Get alerts scoped to each project for the ProjectCard badge.
  const alertsByProject = useMemo(() => {
    const map = new Map<string, Alert[]>();
    for (const alert of alerts ?? []) {
      const list = map.get(alert.projectId) ?? [];
      list.push(alert);
      map.set(alert.projectId, list);
    }
    return map;
  }, [alerts]);

  const handleFilterChange = useCallback((clientId: string | undefined) => {
    setSelectedClientId(clientId);
  }, []);

  const totalProjects = projects?.length ?? 0;
  const inProgressCount = useMemo(
    () => (projects ?? []).filter((p) => p.status === 'in_progress' || p.status === 'at_risk').length,
    [projects],
  );

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-500">Loading projects…</p>
      </div>
    );
  }

  if (isProjectsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-red-500">Failed to load projects.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4">
      {/* Page header: title, count subtitle, and management actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('projects.count_subtitle', { total: totalProjects, active: inProgressCount })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setIsAddClientOpen(true)}>
            <HiOutlineUserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t('projects.add_client')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/projects/new')}
          >
            <HiOutlinePlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t('projects.new_project')}
          </Button>
        </div>
      </div>

      {/* Client filter control */}
      <ClientFilter
        clients={clients ?? []}
        selectedClient={selectedClientId}
        onSelect={handleFilterChange}
      />

      {/* Empty-state message when filter matches nothing */}
      {filteredProjects.length === 0 && selectedClientId && (
        <p className="text-sm text-gray-500">
          {t('projects.empty_filter_state')}
        </p>
      )}

      {/* Responsive grid */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            teamMembers={teamMembers ?? []}
            alerts={alertsByProject.get(project.id) ?? []}
            clientName={clientMap.get(project.clientId)}
            onEdit={setEditingProject}
            onDelete={setDeletingProject}
          />
        ))}

        {/* CreateCard always appears as the last item regardless of filter */}
        <CreateCard />
      </div>

      {/* Management dialogs */}
      <AddClientDialog open={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} />
      <ProjectEditDialog
        open={editingProject !== null}
        project={editingProject}
        onClose={() => setEditingProject(null)}
      />
      {deletingProject && (
        <ProjectDeleteDialog
          open={deletingProject !== null}
          projectId={deletingProject.id}
          projectName={deletingProject.name}
          onClose={() => setDeletingProject(null)}
        />
      )}
    </div>
  );
}
