import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../steps/AccountStep', () => ({
  AccountStep: (props: Record<string, unknown>) => (
    <div data-testid="account-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../steps/SendingCodeStep', () => ({
  SendingCodeStep: (props: Record<string, unknown>) => (
    <div data-testid="sending-code-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../steps/VerifyCodeStep', () => ({
  VerifyCodeStep: (props: Record<string, unknown>) => (
    <div data-testid="verify-code-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../steps/WelcomeStep', () => ({
  WelcomeStep: (props: Record<string, unknown>) => (
    <div data-testid="welcome-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../steps/PersonalInfoStep', () => ({
  PersonalInfoStep: (props: Record<string, unknown>) => (
    <div data-testid="personal-info-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../steps/RoleStep', () => ({
  RoleStep: (props: Record<string, unknown>) => (
    <div data-testid="role-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../steps/PhotoUploadStep', () => ({
  PhotoUploadStep: (props: Record<string, unknown>) => (
    <div data-testid="photo-upload-step" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('../useOnboardingStore', () => ({
  useOnboardingStore: (selector: (state: { signupEmail: string | null }) => unknown) =>
    selector({ signupEmail: 'test@example.com' }),
}));

vi.mock('./RegistrationCarousel.css', () => ({}));

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>();
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

import { RegistrationCarousel } from './RegistrationCarousel';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RegistrationCarousel — includeAccountStep prop', () => {
  const onCompleteMock = vi.fn();

  beforeEach(() => {
    onCompleteMock.mockClear();
  });

  it('renders AccountStep when includeAccountStep is true', () => {
    render(
      <RegistrationCarousel onComplete={onCompleteMock} includeAccountStep={true} />,
    );

    expect(screen.getByTestId('account-step')).toBeInTheDocument();
  });

  it('does NOT render AccountStep when includeAccountStep is false', () => {
    render(
      <RegistrationCarousel onComplete={onCompleteMock} includeAccountStep={false} />,
    );

    expect(screen.queryByTestId('account-step')).not.toBeInTheDocument();
  });

  it('does NOT render AccountStep when includeAccountStep is omitted', () => {
    render(<RegistrationCarousel onComplete={onCompleteMock} />);

    expect(screen.queryByTestId('account-step')).not.toBeInTheDocument();
  });

  it('renders 7 carousel cards when includeAccountStep is true', () => {
    const { container } = render(
      <RegistrationCarousel onComplete={onCompleteMock} includeAccountStep={true} />,
    );

    const cards = container.querySelectorAll('.carousel-card');
    expect(cards).toHaveLength(7);
  });

  it('renders 4 carousel cards when includeAccountStep is false', () => {
    const { container } = render(
      <RegistrationCarousel onComplete={onCompleteMock} includeAccountStep={false} />,
    );

    const cards = container.querySelectorAll('.carousel-card');
    expect(cards).toHaveLength(4);
  });
});
