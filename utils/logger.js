// 📁 backend/utils/logger.js

const logger = {
  info: (...args) => console.log('[KM-EZ ROPA] ✅', ...args),
  warn: (...args) => console.warn('[KM-EZ ROPA] ⚠️', ...args),
  error: (...args) => console.error('[KM-EZ ROPA] ❌', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[KM-EZ ROPA] 🐞', ...args)
    }
  }
}

export default logger
