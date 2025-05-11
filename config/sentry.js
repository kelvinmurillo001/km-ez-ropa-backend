// 📁 backend/config/sentry.js
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN || '', // tu DSN aquí
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development'
})

export default Sentry
