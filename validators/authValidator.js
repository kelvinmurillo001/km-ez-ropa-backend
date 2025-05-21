// 📁 backend/validators/authValidator.js
import { body } from 'express-validator';

/* ───────────────────────────────────────────── */
/* 🔤 Validadores individuales reutilizables     */
/* ───────────────────────────────────────────── */

// 🔹 Username para login de admin
const usernameValidator = body('username')
  .exists({ checkFalsy: true }).withMessage('⚠️ El nombre de usuario es obligatorio.')
  .bail()
  .isString().withMessage('⚠️ Debe ser una cadena de texto.')
  .trim().notEmpty().withMessage('⚠️ No puede estar vacío.')
  .toLowerCase()
  .isLength({ min: 3 }).withMessage('⚠️ Mínimo 3 caracteres.');

// 🔹 Email para login de cliente
const emailValidator = body('email')
  .exists({ checkFalsy: true }).withMessage('⚠️ El correo es obligatorio.')
  .bail()
  .isString().withMessage('⚠️ Debe ser texto.')
  .trim().notEmpty().withMessage('⚠️ No puede estar vacío.')
  .isEmail().withMessage('⚠️ Formato inválido.')
  .normalizeEmail();

// 🔹 Password común
const passwordValidator = body('password')
  .exists({ checkFalsy: true }).withMessage('⚠️ La contraseña es obligatoria.')
  .bail()
  .isString().withMessage('⚠️ Debe ser texto.')
  .trim().notEmpty().withMessage('⚠️ No puede estar vacía.')
  .isLength({ min: 6 }).withMessage('⚠️ Mínimo 6 caracteres.');

/* ───────────────────────────────────────────── */
/* ✅ Validaciones agrupadas por contexto        */
/* ───────────────────────────────────────────── */

// 🛡️ Admin login
export const loginValidation = [usernameValidator, passwordValidator];

// 👤 Cliente login
export const loginClienteValidation = [emailValidator, passwordValidator];

/* ───────────────────────────────────────────── */
/* 📦 Exportar validadores individuales          */
/* ───────────────────────────────────────────── */
export const baseUserValidation = {
  usernameValidator,
  emailValidator,
  passwordValidator
};
