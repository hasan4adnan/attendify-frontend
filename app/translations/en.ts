export const translations = {
  // Common
  common: {
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    continue: 'Continue',
    loading: 'Loading...',
  },

  // Login Page
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue to Attendify',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Forgot?',
    signIn: 'Sign in',
    newToAttendify: 'New to Attendify?',
    createAccount: 'Create an account',
    termsAndPrivacy: 'By signing in, you agree to our ',
    termsOfService: 'Terms of Service',
    and: ' and ',
    privacyPolicy: 'Privacy Policy',
    agreeToTerms: '',
  },

  // Signup Page
  signup: {
    welcome: 'Welcome to Attendify',
    introDescription: 'Streamline your attendance management with our powerful, intuitive platform. Join thousands of organizations already using Attendify to simplify their workflow.',
    whatYouGet: "What you'll get:",
    benefit1: 'Real-time attendance tracking',
    benefit2: 'Automated reports and analytics',
    benefit3: 'Secure and reliable platform',
    
    // Email slide
    emailTitle: "Let's get started",
    emailSubtitle: 'Enter your email address to create your account',
    
    // Name slide
    nameTitle: 'Tell us about yourself',
    nameSubtitle: 'What should we call you?',
    firstNameLabel: 'First Name',
    firstNamePlaceholder: 'John',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'Doe',
    
    // Password slide
    passwordTitle: 'Create a password',
    passwordSubtitle: 'Choose a strong password to secure your account',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: '••••••••',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    
    // Verification slide
    verificationTitle: 'Verify your email',
    verificationSubtitle: "We've sent a verification code to",
    verificationSubtitleEnd: 'Please enter it below.',
    verificationCodeLabel: 'Verification Code',
    verificationCodePlaceholder: '000000',
    didntReceiveCode: "Didn't receive the code?",
    resend: 'Resend',
    completeSignUp: 'Complete Sign Up',
    
    // Common
    step: 'Step',
    of: 'of',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
  },

  // Branding
  branding: {
    tagline: 'Streamline your attendance management with our powerful, intuitive platform.',
    uptime: 'Uptime',
    users: 'Users',
  },
};

export type TranslationKey = keyof typeof translations;

