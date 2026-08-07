import { z } from 'zod';

// --- PersonalInfoStep schema ---
export const PersonalInfoSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  gender: z.enum(['male', 'female']),
  birthDate: z.string().min(1),
});

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;

// --- AccountStep schema ---
export const AccountSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwords_must_match',
    path: ['confirmPassword'],
  });

export type AccountData = z.infer<typeof AccountSchema>;

// --- OrgDetailsStep schema ---
export const OrgDetailsSchema = z.object({
  companyName: z.string().min(1),
  teamSize: z.string().min(1),
  description: z.string().optional(),
});

export type OrgDetailsData = z.infer<typeof OrgDetailsSchema>;

// --- CompanySettingsStep schema ---
export const CompanySettingsSchema = z.object({
  companyName: z.string().min(1),
  teamSize: z.string().min(1),
  description: z.string().optional(),
});

export type CompanySettingsData = z.infer<typeof CompanySettingsSchema>;
