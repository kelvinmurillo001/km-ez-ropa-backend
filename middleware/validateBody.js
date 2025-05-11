// 📁 backend/middleware/validateBody.js

export default function validarBodyGlobal(req, res, next) {
  if (
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'PATCH'
  ) {
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        ok: false,
        message: '❌ El cuerpo (body) debe ser un objeto JSON válido.'
      })
    }
  }
  next()
}
