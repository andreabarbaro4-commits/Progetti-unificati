// Shared domain types for the demo-frontend-integration fixtures.
// Field shapes are adapted from ../demo's packages/shared/src/index.ts, normalized so
// milestones/tasks/documents/alerts/economics live in their own top-level fixture
// modules (referencing their owning entities by id) rather than nested inside Project.

export type ProjectStatus = 'planning' | 'in_progress' | 'at_risk' | 'completed';

export type TaskStatus = 'unassigned' | 'in_progress' | 'completed' | 'blocked';

export type TaskPriority = 'high' | 'medium' | 'low';

export type AlertType = 'overload' | 'delay' | 'outdated_document';

export type BlockType = 'meeting' | 'task' | 'deadline' | 'break';

export type DocumentType = 'pdf' | 'doc' | 'ppt' | 'sheet' | 'image' | 'other';

export type ThumbnailStatus = 'pending' | 'ready' | 'failed';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type MessageRole = 'user' | 'assistant';

export type GroupingMode = 'project' | 'organizationalUnit' | 'client';

export interface Client {
  id: string;
  name: string;
  isInternal?: boolean;
}

export interface TeamMemberLocation {
  city: string;
  lat: number;
  lng: number;
}

export interface TeamMember {
  id: string;
  name: string;
  surname: string;
  role: string;
  email: string;
  photoUrl?: string;
  skills: string[];
  workload: number;
  available: boolean;
  organizationalUnit?: string;
  location?: TeamMemberLocation;
}

export interface Invoice {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
}

export interface CostItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface Economics {
  id: string;
  projectId: string;
  totalBudget: number;
  currentCost: number;
  invoices: Invoice[];
  costItems: CostItem[];
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  brief?: string;
  description?: string;
  deadline: string;
  color?: string;
  cover?: string;
  owner: string;
  members: string[];
  budget?: number;
  type?: string;
  clientId: string;
  economics?: Economics;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  date: string;
  completed: boolean;
  taskIds: string[];
  description?: string;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  assignedTo?: string;
  assignedTo2?: string;
  dependencies?: string[];
  description?: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  fileType: DocumentType;
  updatedAt: string;
  fileKey: string;
  thumbnailKey?: string;
  thumbnailStatus?: ThumbnailStatus;
  milestoneIds?: string[];
  taskIds?: string[];
}

export interface Alert {
  id: string;
  projectId: string;
  memberId?: string;
  type: AlertType;
  message: string;
  triggeredAt: string;
  dismissed?: boolean;
  resolved?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastActiveAt: string;
  projectContext?: string;
}

export interface ChatAttachment {
  fileName: string;
  mimeType: string;
  data: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  isVoiceRecording?: boolean;
}

export interface TimelineBlock {
  id: string;
  projectId?: string;
  memberId: string;
  type: BlockType;
  title: string;
  date: string;
  time: string;
  duration: number;
  completed?: boolean;
  icon?: string;
}

export interface GalleryImage {
  id: string;
  ownerId: string;
  fileKey: string;
  order: number;
  createdAt: string;
}

export interface AuthUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export interface ClusterSource {
  id: string;
  label: string;
  color: string;
  memberIds: string[];
  imageUrl?: string;
  hasAlert?: boolean;
}
