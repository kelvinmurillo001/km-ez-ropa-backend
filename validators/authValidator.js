// 📁 backend/validators/authValidator.js
import { body } from 'express-validator';

/* ───────────────────────────────────────────── */
/* 🔤 Validadores individuales reutilizables     */
/* ───────────────────────────────────────────── */
const usernameValidator = body('username')
  .exists({ checkFalsy: true }).withMessage('⚠️ El nombre de usuario es obligatorio.')
  .bail()
  .isString().withMessage('⚠️ El nombre de usuario debe ser una cadena de texto.')
  .trim()
  .notEmpty().withMessage('⚠️ El nombre de usuario no puede estar vacío.')
  .toLowerCase()
  .isLength({ min: 3 }).withMessage('⚠️ Mínimo 3 caracteres en el nombre de usuario.');

const emailValidator = body('email')
  .exists({ checkFalsy: true }).withMessage('⚠️ El correo electrónico es obligatorio.')
  .bail()
  .isString().withMessage('⚠️ El correo debe ser texto.')
  .trim()
  .notEmpty().withMessage('⚠️ El correo no puede estar vacío.')
  .isEmail().withMessage('⚠️ Debe ser un correo válido.')
  .normalizeEmail();

const passwordValidator = body('password')
  .exists({ checkFalsy: true }).withMessage('⚠️ La contraseña es obligatoria.')
  .bail()
  .isString().withMessage('⚠️ La contraseña debe ser texto.')
  .trim()
  .notEmpty().withMessage('⚠️ La contraseña no puede estar vacía.')
  .isLength({ min: 6 }).withMessage('⚠️ Mínimo 6 caracteres en la contraseña.');

/* ───────────────────────────────────────────── */
/* ✅ Validaciones agrupadas                     */
/* ───────────────────────────────────────────── */

// Admin login: username + password
export const loginValidation = [usernameValidator, passwordValidator];

// Cliente login: email + password
export const loginClienteValidation = [emailValidator, passwordValidator];

/* ───────────────────────────────────────────── */
/* 📦 Exportación de validadores individuales    */
/* ───────────────────────────────────────────── */
export const baseUserValidation = {
  usernameValidator,
  emailValidator,
  passwordValidator
};
