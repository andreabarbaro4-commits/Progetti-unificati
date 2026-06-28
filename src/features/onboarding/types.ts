/** The kind of account a user is onboarding. */
export type OrgType = 'Azienda' | 'professionista'

/** Steps in the onboarding wizard. */
export type OnboardingStep = 1 | 2

/** Form values collected across the onboarding wizard. */
export interface OnboardingForm {
  companyName: string
  teamSize: string
  description: string
}
