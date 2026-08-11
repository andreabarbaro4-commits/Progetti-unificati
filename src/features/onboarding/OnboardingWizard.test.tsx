import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Auth provider
const loginMock = vi.fn()
const loginWithHintMock = vi.fn()
const signupMock = vi.fn()

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: loginMock,
    loginWithHint: loginWithHintMock,
    signup: signupMock,
    logout: vi.fn(),
    getAccessToken: vi.fn(() => null),
    silentRefresh: vi.fn(),
    isSessionExpired: false,
    establishSession: vi.fn(),
  }),
}))

// Onboarding store
const setSignupEmailMock = vi.fn()
const setPhaseMock = vi.fn()

const storeState = {
  phase: 'registration' as const,
  signupEmail: 'test@example.com',
  setSignupEmail: setSignupEmailMock,
  setPhase: setPhaseMock,
  activeStep: 0,
  selectedRole: null,
  setActiveStep: vi.fn(),
  setSelectedRole: vi.fn(),
  reset: vi.fn(),
}

vi.mock('./useOnboardingStore', () => ({
  useOnboardingStore: Object.assign(
    (selector?: (s: typeof storeState) => unknown) =>
      selector ? selector(storeState) : storeState,
    { getState: () => storeState },
  ),
}))

// Auth0 signup client
const signupWithAuth0Mock = vi.fn()
vi.mock('../../features/auth/auth0-signup', () => ({
  signupWithAuth0: (...args: unknown[]) => signupWithAuth0Mock(...args),
}))

// Mock mode
vi.mock('../../mock', () => ({
  isMockMode: () => false,
}))

// react-router-dom
const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

// Profile check hook
vi.mock('./hooks/useProfileCheck', () => ({
  useProfileCheck: () => ({
    data: null,
    isLoading: false,
    isFetching: false,
    error: null,
  }),
}))

// react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

// CSS imports
vi.mock('./OnboardingWizard.css', () => ({}))
vi.mock('./components/RegistrationCarousel.css', () => ({}))

// Mock FlowleeLogo to avoid SVG issues
vi.mock('../../components/AppShell/FlowleeLogo', () => ({
  FlowleeLogo: () => <div data-testid="flowlee-logo" />,
}))

// Mock TopNavigationBar
vi.mock('../../components/AppShell/TopNavigationBar', () => ({
  TopNavigationBar: () => <div data-testid="top-nav" />,
}))

// Mock createPortal to render inline instead of in document.body
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  }
})

// Mock non-essential steps as simple placeholders
vi.mock('./steps/SendingCodeStep', () => ({
  SendingCodeStep: ({ onNext }: { onNext: () => void; email: string }) => (
    <div data-testid="sending-code-step">
      <button data-testid="sending-code-next" onClick={onNext} type="button">
        SendingCode Next
      </button>
    </div>
  ),
}))

vi.mock('./steps/VerifyCodeStep', () => ({
  VerifyCodeStep: ({ onNext }: { onNext: () => void; email: string }) => (
    <div data-testid="verify-code-step">
      <button data-testid="verify-code-next" onClick={onNext} type="button">
        VerifyCode Next
      </button>
    </div>
  ),
}))

vi.mock('./steps/WelcomeStep', () => ({
  WelcomeStep: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="welcome-step">
      <button data-testid="welcome-next" onClick={onNext} type="button">
        Welcome Next
      </button>
    </div>
  ),
}))

vi.mock('./steps/PersonalInfoStep', () => ({
  PersonalInfoStep: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="personal-info-step">
      <button data-testid="personalinfo-next" onClick={onNext} type="button">
        PersonalInfo Next
      </button>
    </div>
  ),
}))

vi.mock('./steps/RoleStep', () => ({
  RoleStep: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="role-step">
      <button data-testid="role-next" onClick={onNext} type="button">
        Role Next
      </button>
    </div>
  ),
}))

vi.mock('./steps/PhotoUploadStep', () => ({
  PhotoUploadStep: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="photo-upload-step">
      <button data-testid="photo-next" onClick={onNext} type="button">
        Photo Next
      </button>
    </div>
  ),
}))

// Mock auth0-error-map
vi.mock('../../features/auth/auth0-error-map', () => ({
  mapAuth0Error: (code: string) => `auth.errors.${code}`,
}))

// Mock VerticalCarouselWizard (not part of registration phase tests)
vi.mock('./components/VerticalCarouselWizard', () => ({
  VerticalCarouselWizard: () => <div data-testid="vertical-wizard" />,
}))

import { OnboardingWizard } from './OnboardingWizard'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OnboardingWizard — integration', () => {
  beforeEach(() => {
    loginMock.mockClear()
    loginWithHintMock.mockClear()
    signupMock.mockClear()
    signupWithAuth0Mock.mockClear()
    setSignupEmailMock.mockClear()
    setPhaseMock.mockClear()
    navigateMock.mockClear()
    storeState.phase = 'registration'
    storeState.signupEmail = 'test@example.com'

    signupWithAuth0Mock.mockResolvedValue({
      _id: '64abc123',
      email: 'test@example.com',
      email_verified: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Requirement 5.1: Login button triggers login() redirect ─────────

  it('calls login() when "Login" button is clicked on AuthChoiceStep', () => {
    render(<OnboardingWizard />)

    const loginBtn = screen.getByRole('button', { name: /auth\.login/i })
    fireEvent.click(loginBtn)

    expect(loginMock).toHaveBeenCalledWith('/onboarding')
  })

  // ─── Requirement 1.1: Sign Up shows embedded carousel with AccountStep ─

  it('shows AccountStep in carousel after clicking "Sign Up"', () => {
    render(<OnboardingWizard />)

    // AuthChoiceStep should be visible first
    const signUpBtn = screen.getByRole('button', { name: /auth\.sign_up/i })
    fireEvent.click(signUpBtn)

    // After clicking Sign Up, the RegistrationCarousel with AccountStep should render
    // AccountStep has email/password fields
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument()
  })

  // ─── Requirements 1.1, 4.1: Full signup flow triggers loginWithHint ────

  it('calls loginWithHint with signup email when carousel completes after signup', async () => {
    vi.useFakeTimers()

    render(<OnboardingWizard />)

    // Step 1: Click "Sign Up"
    fireEvent.click(screen.getByRole('button', { name: /auth\.sign_up/i }))

    // Step 2: Fill and submit AccountStep form
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'SecureP@ss1' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: 'SecureP@ss1' },
    })

    // The AccountStep submit button is a type="submit" button
    const submitButton = screen.getByRole('button', { name: /^next$/i })
    await act(async () => {
      fireEvent.submit(submitButton)
    })

    // Wait for signupWithAuth0 to resolve and carousel to advance
    // Flush microtasks for the async signup call
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(signupWithAuth0Mock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecureP@ss1',
    })

    // Step 3: AccountStep advances — carousel transitions to SendingCodeStep
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // transition to SendingCodeStep
    })

    // SendingCodeStep should be visible
    expect(screen.getByTestId('sending-code-step')).toBeInTheDocument()

    // Advance through SendingCodeStep
    await act(async () => {
      fireEvent.click(screen.getByTestId('sending-code-next'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // transition to VerifyCodeStep
    })

    // VerifyCodeStep should be visible
    expect(screen.getByTestId('verify-code-step')).toBeInTheDocument()

    // Advance through VerifyCodeStep
    await act(async () => {
      fireEvent.click(screen.getByTestId('verify-code-next'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // transition to WelcomeStep
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600) // expand duration completes
    })

    // WelcomeStep should now be interactive (rendered via portal in expand state)
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument()

    // Click WelcomeStep next — triggers collapse animation
    await act(async () => {
      fireEvent.click(screen.getByTestId('welcome-next'))
    })

    // Wait for collapse (400ms) + transition (400ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // collapseDuration
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // transitionDuration post-collapse
    })

    // PersonalInfoStep should be visible
    expect(screen.getByTestId('personalinfo-next')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('personalinfo-next'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // normal advance transition
    })

    // RoleStep
    expect(screen.getByTestId('role-next')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('role-next'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500) // normal advance transition
    })

    // PhotoUploadStep
    expect(screen.getByTestId('photo-next')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('photo-next'))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    // Step 4: Verify loginWithHint was called with the signup email
    expect(loginWithHintMock).toHaveBeenCalledWith('test@example.com', '/onboarding')

    vi.useRealTimers()
  })
})
