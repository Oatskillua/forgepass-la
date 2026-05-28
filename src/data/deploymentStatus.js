import { appVersion } from '../config/appVersion'

export const deploymentStatus = [
  {
    label: 'Application Version',
    value: appVersion.version,
    detail: 'Current public platform version.',
  },
  {
    label: 'Release Stage',
    value: appVersion.stage,
    detail: 'Current operational release channel.',
  },
  {
    label: 'Build Environment',
    value: appVersion.build,
    detail: 'Current deployment environment identifier.',
  },
  {
    label: 'Deployment Target',
    value: 'Vercel',
    detail: 'Production deployment infrastructure.',
  },
]