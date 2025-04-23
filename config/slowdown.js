// config/slowdown.js
import slowDown from 'express-slow-down'

const slow = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutos
  delayAfter: 20, // después de 20 requests...
  delayMs: 500 // ...añade 0.5 seg por request extra
})

export default slow
