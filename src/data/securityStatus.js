export const securityStatus = [
  {
    title: 'Supabase RLS',
    status: 'Enabled',
    detail:
      'Row-level security policies restrict public access while allowing controlled waitlist submissions.',
  },
  {
    title: 'Environment Protection',
    status: 'Verified',
    detail:
      'Environment variables are excluded from version control and no service-role keys are exposed client-side.',
  },
  {
    title: 'Duplicate Protection',
    status: 'Active',
    detail:
      'Unique email constraints and frontend duplicate handling prevent repeated waitlist submissions.',
  },
  {
    title: 'Error Containment',
    status: 'Operational',
    detail:
      'Custom error boundaries and fallback routing protect the application shell from runtime failures.',
  },
  {
    title: 'Analytics Instrumentation',
    status: 'Structured',
    detail:
      'Centralized analytics events track engagement, navigation, conversion, and route activity.',
  },
  {
    title: 'Abuse Protection',
    status: 'Planned',
    detail:
      'Cloudflare Turnstile integration is planned before broader public onboarding.',
  },
]