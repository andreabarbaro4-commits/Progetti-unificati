import { z } from 'zod';

// --- PersonalInfoStep schema ---
export const PersonalInfoSchema = z.object({
  name: z.string().min(1, 'validation.required'),
  surname: z.string().min(1, 'validation.required'),
  gender: z.enum(['male', 'female', 'other'], { message: 'validation.required' }),
  birthDate: z.string().min(1, 'validation.required'),
});

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;

// --- AccountStep schema ---
export const AccountSchema = z
  .object({
    email: z.string().min(1, 'validation.required').email('validation.email_invalid'),
    password: z.string().min(8, 'validation.field_too_short'),
    confirmPassword: z.string().min(1, 'validation.required'),
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

// --- ContactInfoStep schema ---
export const ContactInfoSchema = z.object({
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type ContactInfoData = z.infer<typeof ContactInfoSchema>;

// --- CompanySettingsStep schema ---
export const CompanySettingsSchema = z.object({
  companyName: z.string().min(1),
  teamSize: z.string().min(1),
  description: z.string().optional(),
});

export type CompanySettingsData = z.infer<typeof CompanySettingsSchema>;
