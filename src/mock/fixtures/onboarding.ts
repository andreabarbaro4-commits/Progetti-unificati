export interface OrgType {
  id: string;
  label: string;
  description: string;
}

export interface Role {
  id: string;
  label: string;
  description: string;
}

export const mockOrgTypes: OrgType[] = [
  {
    id: 'startup',
    label: 'Startup',
    description: 'Early-stage company focused on rapid growth and innovation',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    description: 'Large established organization with structured processes',
  },
  {
    id: 'agency',
    label: 'Agency',
    description: 'Service-based company delivering projects for clients',
  },
  {
    id: 'non-profit',
    label: 'Non-profit',
    description: 'Mission-driven organization focused on social impact',
  },
];

export const mockRoles: Role[] = [
  {
    id: 'product-manager',
    label: 'Product Manager',
    description: 'Defines product vision and prioritizes the backlog',
  },
  {
    id: 'developer',
    label: 'Developer',
    description: 'Builds and maintains application code and infrastructure',
  },
  {
    id: 'designer',
    label: 'Designer',
    description: 'Creates user interfaces and design systems',
  },
  {
    id: 'qa-engineer',
    label: 'QA Engineer',
    description: 'Ensures product quality through testing and automation',
  },
  {
    id: 'devops',
    label: 'DevOps',
    description: 'Manages CI/CD pipelines, deployments, and infrastructure',
  },
];
