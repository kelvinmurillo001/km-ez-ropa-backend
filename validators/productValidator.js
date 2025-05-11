// 📁 backend/validators/productValidator.js
import { body } from 'express-validator'

/* ───────────────────────────────────────────────────────────── */
/* 📸 Validaciones comunes para imágenes principales y variantes */
/* ───────────────────────────────────────────────────────────── */

// ✅ Reglas para la imagen principal del producto
const imagenPrincipalRules = [
  body('images')
    .isArray({ min: 1, max: 1 }).withMessage('⚠️ Debes enviar exactamente una imagen en formato array.'),

  body('images.*.url')
    .notEmpty().withMessage('⚠️ La imagen necesita una URL válida.').bail()
    .isURL().withMessage('⚠️ La URL de la imagen es inválida.'),

  body('images.*.cloudinaryId')
    .notEmpty().withMessage('⚠️ cloudinaryId de imagen requerido.'),

  body('images.*.talla')
    .notEmpty().withMessage('⚠️ Talla de la imagen requerida.'),

  body('images.*.color')
    .notEmpty().withMessage('⚠️ Color de la imagen requerido.')
]

// ✅ Reglas para variantes del producto
const variantesRules = [
  body('variants')
    .optional()
    .isArray({ max: 4 }).withMessage('⚠️ Máximo 4 variantes permitidas.'),

  body('variants.*.talla')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante necesita una talla.'),

  body('variants.*.color')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante necesita un color.'),

  body('variants.*.imageUrl')
    .optional()
    .notEmpty().withMessage('⚠️ La variante debe incluir una imagen.').bail()
    .isURL().withMessage('⚠️ La URL de la imagen de variante es inválida.'),

  body('variants.*.cloudinaryId')
    .optional()
    .notEmpty().withMessage('⚠️ cloudinaryId requerido para la variante.'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 }).withMessage('⚠️ El stock de la variante debe ser un entero ≥ 0.')
]

/* ───────────────────────────────────────────── */
/* 🆕 Validaciones para CREAR Producto           */
/* ───────────────────────────────────────────── */
export const createProductValidation = [
  body('name')
    .notEmpty().withMessage('⚠️ El nombre del producto es obligatorio.').bail()
    .isString().withMessage('⚠️ El nombre debe ser texto.').bail()
    .isLength({ min: 2 }).withMessage('⚠️ Mínimo 2 caracteres.'),

  body('price')
    .notEmpty().withMessage('⚠️ El precio es obligatorio.').bail()
    .isFloat({ gt: 0 }).withMessage('⚠️ Debe ser un número mayor a 0.'),

  body('category')
    .notEmpty().withMessage('⚠️ La categoría es obligatoria.'),

  body('subcategory')
    .notEmpty().withMessage('⚠️ La subcategoría es obligatoria.'),

  body('tallaTipo')
    .notEmpty().withMessage('⚠️ El tipo de talla es obligatorio.'),

  body('createdBy')
    .notEmpty().withMessage('⚠️ Campo createdBy obligatorio.'),

  body('sizes')
    .optional()
    .isArray().withMessage('⚠️ El campo sizes debe ser un arreglo.'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('⚠️ El stock debe ser un entero ≥ 0.'),

  body('featured')
    .optional()
    .isBoolean().withMessage('⚠️ featured debe ser booleano.'),

  body('color')
    .optional()
    .isString().withMessage('⚠️ Color inválido.'),

  ...imagenPrincipalRules,
  ...variantesRules
]

/* ───────────────────────────────────────────── */
/* ✏️ Validaciones para ACTUALIZAR Producto      */
/* ───────────────────────────────────────────── */
const updateImagenRules = imagenPrincipalRules.map(rule => rule.optional())
const updateVarianteRules = variantesRules.map(rule => rule.optional())

export const updateProductValidation = [
  body('name')
    .optional()
    .isString().withMessage('⚠️ El nombre debe ser texto.').bail()
    .isLength({ min: 2 }).withMessage('⚠️ Nombre demasiado corto.'),

  body('price')
    .optional()
    .isFloat({ gt: 0 }).withMessage('⚠️ El precio debe ser positivo.'),

  body('category')
    .optional()
    .isString().withMessage('⚠️ Categoría inválida.'),

  body('subcategory')
    .optional()
    .isString().withMessage('⚠️ Subcategoría inválida.'),

  body('tallaTipo')
    .optional()
    .isString().withMessage('⚠️ Tipo de talla inválido.'),

  body('color')
    .optional()
    .isString().withMessage('⚠️ Color inválido.'),

  body('sizes')
    .optional()
    .isArray().withMessage('⚠️ Sizes debe ser un arreglo.'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('⚠️ El stock debe ser un entero ≥ 0.'),

  body('featured')
    .optional()
    .isBoolean().withMessage('⚠️ featured debe ser booleano.'),

  ...updateImagenRules,
  ...updateVarianteRules
]
