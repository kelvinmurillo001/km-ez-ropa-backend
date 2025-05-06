// 📁 backend/validators/authValidator.js

import { body } from 'express-validator'

const usernameValidator = body('username')
  .trim()
  .notEmpty().withMessage('⚠️ El nombre de usuario es obligatorio.')
  .isLength({ min: 3 }).withMessage('⚠️ Mínimo 3 caracteres en el nombre de usuario.')
  .escape()

const passwordValidator = body('password')
  .trim()
  .notEmpty().withMessage('⚠️ La contraseña es obligatoria.')
  .isLength({ min: 6 }).withMessage('⚠️ Mínimo 6 caracteres en la contraseña.')
  .escape()

// 🛡️ Validador para login de administrador
export const loginValidation = [usernameValidator, passwordValidator]

// (Opcional) Reutilizable para futuros registros/login de usuarios
export const baseUserValidation = {
  usernameValidator,
  passwordValidator
}
