// 📁 backend/validators/authValidator.js

import { body } from 'express-validator';

// 🧪 Validaciones individuales reutilizables
const usernameValidator = body('username')
  .exists({ checkFalsy: true }).withMessage('⚠️ El nombre de usuario es obligatorio.')
  .bail()
  .isString().withMessage('⚠️ El nombre de usuario debe ser una cadena de texto.')
  .trim()
  .notEmpty().withMessage('⚠️ El nombre de usuario no puede estar vacío.')
  .toLowerCase()
  .isLength({ min: 3 }).withMessage('⚠️ Mínimo 3 caracteres en el nombre de usuario.');

const passwordValidator = body('password')
  .exists({ checkFalsy: true }).withMessage('⚠️ La contraseña es obligatoria.')
  .bail()
  .isString().withMessage('⚠️ La contraseña debe ser una cadena de texto.')
  .trim()
  .notEmpty().withMessage('⚠️ La contraseña no puede estar vacía.')
  .isLength({ min: 6 }).withMessage('⚠️ Mínimo 6 caracteres en la contraseña.');

// 🛡️ Validador principal para login de administrador
export const loginValidation = [usernameValidator, passwordValidator];

// 📦 Exportación para reuso flexible
export const baseUserValidation = {
  usernameValidator,
  passwordValidator
};
