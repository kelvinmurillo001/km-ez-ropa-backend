// 📁 backend/middleware/validateBody.js
export default function validarBodyGlobal(req, res, next) {
  if (req.is('application/json') && req.body && typeof req.body !== 'object') {
    return res.status(400).json({ ok: false, message: '❌ JSON inválido.' })
  }
  next()
}
