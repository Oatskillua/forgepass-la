import { loadEnv } from 'vite'
import { validateMobileConfig } from './mobileConfig.js'

// Match the default production mode used by `vite build` in mobile:sync.
const settings = loadEnv('production', process.cwd(), 'VITE_')
const problems = validateMobileConfig(settings)
if (problems.length) {
  console.error('Mobile configuration check failed:\n' + problems.map((problem) => `- ${problem}`).join('\n'))
  console.error('Set the deployment values in the build environment or .env.production.local, then retry. Values are not printed.')
  process.exitCode = 1
} else {
  console.log('Mobile configuration syntax passed. Hosted connectivity, CORS, Auth, device behavior and signing still require verification.')
}
