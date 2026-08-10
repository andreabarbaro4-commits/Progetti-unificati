import { apiClient } from '../../../lib/api-client';

// ---------------------------------------------------------------------------
// Types matching openapi.yml schemas
// ---------------------------------------------------------------------------

export interface CreateUserProfileRequest {
  userId: string;
  email: string;
  name?: string;
  surname?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // YYYY-MM-DD
  jobTitle?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  surname?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  jobTitle?: string;
  photo?: PhotoReference;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoReference {
  photoId: string;
  ext: 'jpg' | 'png' | 'webp' | 'gif';
}

export interface PresignRequest {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  sizeBytes: number;
}

export interface PresignResponse {
  photoId: string;
  key: string;
  uploadUrl: string;
  contentType: string;
  sizeBytes: number;
  expiresIn: number;
}

export interface UpdateUserProfileRequest {
  email?: string;
  name?: string;
  surname?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  jobTitle?: string;
  photo?: PhotoReference | null;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export function getUserProfile(userId: string): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`/api/users/${userId}`);
}

export function createUserProfile(
  data: CreateUserProfileRequest,
): Promise<UserProfile> {
  return apiClient.post<UserProfile>('/api/users', data);
}

export function presignPhotoUpload(
  userId: string,
  data: PresignRequest,
): Promise<PresignResponse> {
  return apiClient.post<PresignResponse>(
    `/api/users/${userId}/photo/presign`,
    data,
  );
}

export function updateUserProfile(
  userId: string,
  data: UpdateUserProfileRequest,
): Promise<UserProfile> {
  return apiClient.put<UserProfile>(`/api/users/${userId}`, data);
}

export async function uploadToS3(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`S3 upload failed with status ${response.status}`);
  }
}
