import { validationResult } from 'express-validator'

const validarErrores = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() })
  }
  next()
}

export default validarErrores
