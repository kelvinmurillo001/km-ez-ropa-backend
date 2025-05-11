// 📁 backend/validators/authValidator.js

import { body } from 'express-validator'

// 🧪 Validaciones individuales reutilizables
const usernameValidator = body('username')
  .exists({ checkFalsy: true }).withMessage('⚠️ El nombre de usuario es obligatorio.')
  .isString().withMessage('⚠️ El nombre de usuario debe ser una cadena de texto.')
  .trim()
  .isLength({ min: 3 }).withMessage('⚠️ Mínimo 3 caracteres en el nombre de usuario.')
  .escape()

const passwordValidator = body('password')
  .exists({ checkFalsy: true }).withMessage('⚠️ La contraseña es obligatoria.')
  .isString().withMessage('⚠️ La contraseña debe ser una cadena de texto.')
  .trim()
  .isLength({ min: 6 }).withMessage('⚠️ Mínimo 6 caracteres en la contraseña.')
  .escape()

// 🛡️ Validador principal para login de administrador
export const loginValidation = [usernameValidator, passwordValidator]

// 📦 Exportación para reuso flexible
export const baseUserValidation = {
  usernameValidator,
  passwordValidator
}
