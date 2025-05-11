// 📁 backend/config/sentry.js
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new RewriteFrames({
      root: __dirname, // 👈 corregido
    })
  ],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development'
});

export default Sentry;
