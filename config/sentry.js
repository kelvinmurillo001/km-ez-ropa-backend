// 📁 backend/config/sentry.js
import * as Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new RewriteFrames({ root: global.__dirname })],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development'
})

export default Sentry
