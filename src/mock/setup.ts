import { registerMockHandler, enableMockApi } from './mock-api-client';
import { mockProjects, mockTasks, mockTeamMembers } from './fixtures/dashboard';
import { mockOrgTypes, mockRoles } from './fixtures/onboarding';

// Register handlers for known endpoints
registerMockHandler('GET', '/projects', () => mockProjects);
registerMockHandler('GET', '/tasks', () => mockTasks);
registerMockHandler('GET', '/team', () => mockTeamMembers);
registerMockHandler('GET', '/onboarding/org-types', () => mockOrgTypes);
registerMockHandler('GET', '/onboarding/roles', () => mockRoles);

// Activate mock interception
enableMockApi();
