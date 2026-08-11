import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const signupWithAuth0Mock = vi.fn();
vi.mock('../../auth/auth0-signup', () => ({
  signupWithAuth0: (...args: unknown[]) => signupWithAuth0Mock(...args),
}));

const mapAuth0ErrorMock = vi.fn((code: string) => `auth.errors.${code}`);
vi.mock('../../auth/auth0-error-map', () => ({
  mapAuth0Error: (...args: unknown[]) => mapAuth0ErrorMock(...args),
}));

const setSignupEmailMock = vi.fn();
vi.mock('../useOnboardingStore', () => ({
  useOnboardingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setSignupEmail: setSignupEmailMock }),
}));

const isMockModeMock = vi.fn(() => false);
vi.mock('../../../mock', () => ({
  isMockMode: () => isMockModeMock(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

// Mock FlowleeLogo to avoid SVG import issues
vi.mock('../../../components/AppShell/FlowleeLogo', () => ({
  FlowleeLogo: () => <div data-testid="flowlee-logo" />,
}));

import { AccountStep } from './AccountStep';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = 'SecureP@ss1';

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText('email'), {
    target: { value: VALID_EMAIL },
  });
  fireEvent.change(screen.getByPlaceholderText('password'), {
    target: { value: VALID_PASSWORD },
  });
  fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
    target: { value: VALID_PASSWORD },
  });
}

async function fillAndSubmit() {
  fillForm();
  await act(async () => {
    fireEvent.submit(screen.getByRole('button', { name: /next/i }));
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AccountStep — signup integration', () => {
  const onNextMock = vi.fn();

  beforeEach(() => {
    onNextMock.mockClear();
    signupWithAuth0Mock.mockClear();
    mapAuth0ErrorMock.mockClear();
    setSignupEmailMock.mockClear();
    isMockModeMock.mockReturnValue(false);
    signupWithAuth0Mock.mockResolvedValue({
      _id: '64abc123',
      email: VALID_EMAIL,
      email_verified: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Loading state (Requirement 3.4) ────────────────────────────────────

  it('shows loading state and disables button during submission', async () => {
    // Make signup hang to observe the loading state
    let resolveSignup!: (value: unknown) => void;
    signupWithAuth0Mock.mockImplementation(
      () => new Promise((resolve) => { resolveSignup = resolve; }),
    );

    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    fillForm();

    // Submit and observe loading state
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /next/i }));
    });

    // While pending: button shows loading text and is disabled
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('loading');
      expect(screen.getByRole('button')).toBeDisabled();
    });

    // Resolve the pending signup
    await act(async () => {
      resolveSignup({ _id: '123', email: VALID_EMAIL, email_verified: false });
    });

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalled();
    });
  });

  // ─── Error message display (Requirement 3.5) ───────────────────────────

  it('displays error message when signup returns user_exists', async () => {
    signupWithAuth0Mock.mockRejectedValue({
      code: 'user_exists',
      description: 'The user already exists.',
      statusCode: 400,
    });
    mapAuth0ErrorMock.mockReturnValue('auth.errors.email_already_registered');

    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    await fillAndSubmit();

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const signupAlert = alerts.find((el) =>
        el.textContent?.includes('auth.errors.email_already_registered'),
      );
      expect(signupAlert).toBeInTheDocument();
    });

    expect(mapAuth0ErrorMock).toHaveBeenCalledWith('user_exists', 'The user already exists.');
    expect(onNextMock).not.toHaveBeenCalled();
  });

  it('displays error message when signup returns password_strength_error', async () => {
    signupWithAuth0Mock.mockRejectedValue({
      code: 'password_strength_error',
      description: 'Password is too weak',
      statusCode: 400,
    });
    mapAuth0ErrorMock.mockReturnValue('auth.errors.password_too_weak: Password is too weak');

    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    await fillAndSubmit();

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const signupAlert = alerts.find((el) =>
        el.textContent?.includes('auth.errors.password_too_weak'),
      );
      expect(signupAlert).toBeInTheDocument();
    });

    expect(mapAuth0ErrorMock).toHaveBeenCalledWith('password_strength_error', 'Password is too weak');
  });

  it('displays error message for network_error', async () => {
    signupWithAuth0Mock.mockRejectedValue({
      code: 'network_error',
      description: 'A network error occurred.',
      statusCode: 0,
    });
    mapAuth0ErrorMock.mockReturnValue('auth.errors.network_error');

    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    await fillAndSubmit();

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const signupAlert = alerts.find((el) =>
        el.textContent?.includes('auth.errors.network_error'),
      );
      expect(signupAlert).toBeInTheDocument();
    });
  });

  // ─── Form data preserved after error (Requirement 3.5) ─────────────────

  it('preserves form data after an error so user can correct and retry', async () => {
    signupWithAuth0Mock.mockRejectedValueOnce({
      code: 'user_exists',
      description: 'The user already exists.',
      statusCode: 400,
    });
    mapAuth0ErrorMock.mockReturnValue('auth.errors.email_already_registered');

    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    await fillAndSubmit();

    // Wait for error to appear
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.some((el) => el.textContent?.includes('auth.errors.email_already_registered'))).toBe(true);
    });

    // Form fields should still contain entered data
    expect(screen.getByPlaceholderText('email')).toHaveValue(VALID_EMAIL);
    expect(screen.getByPlaceholderText('password')).toHaveValue(VALID_PASSWORD);
    expect(screen.getByPlaceholderText('confirm_password')).toHaveValue(VALID_PASSWORD);

    // Button should be re-enabled after error
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  // ─── Mock mode bypass (Requirement 1.4) ────────────────────────────────

  it('bypasses API call and advances directly in mock mode', async () => {
    isMockModeMock.mockReturnValue(true);

    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    fillForm();

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /next/i }));
    });

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalled();
    });

    // signupWithAuth0 should NOT have been called
    expect(signupWithAuth0Mock).not.toHaveBeenCalled();
    // setSignupEmail should still be called with the email
    expect(setSignupEmailMock).toHaveBeenCalledWith(VALID_EMAIL);
  });

  // ─── Success path ──────────────────────────────────────────────────────

  it('calls setSignupEmail and onNext on successful signup', async () => {
    render(<AccountStep onNext={onNextMock} firstName="Marco" />);

    await fillAndSubmit();

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalled();
    });

    expect(signupWithAuth0Mock).toHaveBeenCalledWith({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
    });
    expect(setSignupEmailMock).toHaveBeenCalledWith(VALID_EMAIL);
  });
});
