import { useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import type { ApiError } from '../../../lib/api-client';
import type { RegistrationData } from '../useRegistrationStore';
import {
  createUserProfile,
  presignPhotoUpload,
  uploadToS3,
  updateUserProfile,
} from '../api/registration-api';
import type {
  CreateUserProfileRequest,
  PresignRequest,
  PhotoReference,
} from '../api/registration-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreationStep =
  | 'idle'
  | 'creating'
  | 'presigning'
  | 'uploading'
  | 'updating'
  | 'done';

interface SubmitRegistrationParams {
  userId: string;
  email: string;
  profileData: RegistrationData;
}

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

function mapErrorToMessage(error: unknown): string {
  // S3 upload errors are plain Error instances (not ApiError)
  if (error instanceof Error && error.message.startsWith('S3 upload failed')) {
    return 'Photo upload failed. Please try again.';
  }

  // ApiError from apiClient
  const apiError = error as ApiError;

  if (apiError.status === null) {
    return 'Connection error. Please check your internet and try again.';
  }

  if (apiError.status === 400) {
    return apiError.message;
  }

  if (apiError.status === 403) {
    return 'Authorization error. Please sign in again.';
  }

  if (apiError.status === 500) {
    return 'Something went wrong. Please try again.';
  }

  // Fallback for other status codes
  return 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------------------
// Content type helpers
// ---------------------------------------------------------------------------

type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

function fileContentType(file: File): ImageContentType {
  return file.type as ImageContentType;
}

function contentTypeToExt(contentType: string): PhotoReference['ext'] {
  const map: Record<string, PhotoReference['ext']> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[contentType] ?? 'jpg';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProfileCreation() {
  const [currentStep, setCurrentStep] = useState<CreationStep>('idle');
  const [error, setError] = useState<string | null>(null);

  // Step 1: Create UserProfile
  const createProfileMutation = useMutation({
    mutationFn: (data: CreateUserProfileRequest) => createUserProfile(data),
  });

  // Step 2: Presign photo upload
  const presignMutation = useMutation({
    mutationFn: (params: { userId: string; data: PresignRequest }) =>
      presignPhotoUpload(params.userId, params.data),
  });

  // Step 3: Upload to S3
  const uploadMutation = useMutation({
    mutationFn: (params: { uploadUrl: string; file: File; contentType: string }) =>
      uploadToS3(params.uploadUrl, params.file, params.contentType),
  });

  // Step 4: Update profile with PhotoReference
  const updateProfileMutation = useMutation({
    mutationFn: (params: { userId: string; photo: PhotoReference }) =>
      updateUserProfile(params.userId, { photo: params.photo }),
  });

  // Orchestrator function
  const submitRegistration = useCallback(
    async (params: SubmitRegistrationParams): Promise<void> => {
      const { userId, email, profileData } = params;

      setError(null);

      try {
        // Step 1: Create profile
        setCurrentStep('creating');
        await createProfileMutation.mutateAsync({
          userId,
          email,
          name: profileData.name,
          surname: profileData.surname,
          gender: profileData.gender || undefined,
          birthDate: profileData.birthDate || undefined,
          jobTitle: profileData.jobTitle || undefined,
        });

        // Step 2-4: Photo upload chain (skip if no file)
        if (profileData.selectedPhotoFile) {
          const file = profileData.selectedPhotoFile;
          const contentType = fileContentType(file);

          // Step 2: Presign
          setCurrentStep('presigning');
          const presignResponse = await presignMutation.mutateAsync({
            userId,
            data: {
              contentType,
              sizeBytes: file.size,
            },
          });

          // Step 3: Upload to S3
          setCurrentStep('uploading');
          await uploadMutation.mutateAsync({
            uploadUrl: presignResponse.uploadUrl,
            file,
            contentType,
          });

          // Step 4: Update profile with photo reference
          setCurrentStep('updating');
          await updateProfileMutation.mutateAsync({
            userId,
            photo: {
              photoId: presignResponse.photoId,
              ext: contentTypeToExt(presignResponse.contentType),
            },
          });
        }

        setCurrentStep('done');
      } catch (err: unknown) {
        setError(mapErrorToMessage(err));
        throw err;
      }
    },
    [createProfileMutation, presignMutation, uploadMutation, updateProfileMutation],
  );

  const isSubmitting =
    createProfileMutation.isPending ||
    presignMutation.isPending ||
    uploadMutation.isPending ||
    updateProfileMutation.isPending;

  const reset = useCallback(() => {
    createProfileMutation.reset();
    presignMutation.reset();
    uploadMutation.reset();
    updateProfileMutation.reset();
    setCurrentStep('idle');
    setError(null);
  }, [createProfileMutation, presignMutation, uploadMutation, updateProfileMutation]);

  return {
    submitRegistration,
    isSubmitting,
    error,
    reset,
    currentStep,
  };
}
