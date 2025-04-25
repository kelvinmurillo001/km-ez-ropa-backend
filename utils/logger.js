// 📁 backend/utils/logger.js

const logPrefix = '[KM-EZ ROPA]'

const logger = {
  info: (...args) => {
    console.log(`${logPrefix} ✅`, ...args)
  },
  warn: (...args) => {
    console.warn(`${logPrefix} ⚠️`, ...args)
  },
  error: (...args) => {
    console.error(`${logPrefix} ❌`, ...args)
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${logPrefix} 🐞`, ...args)
    }
  }
}

export default logger
