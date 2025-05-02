// 📁 backend/validators/productValidator.js
import { body } from 'express-validator'

/* -------------------------------------------------------------------------- */
/* 🔐 Reglas Comunes para Imagen Principal                                    */
/* -------------------------------------------------------------------------- */
const imagenPrincipalRules = [
  body('images')
    .isArray({ min: 1, max: 1 })
    .withMessage('⚠️ Debes enviar una imagen principal (array con 1 objeto).'),

  body('images.*.url')
    .notEmpty().withMessage('⚠️ La imagen principal necesita una URL válida.'),

  body('images.*.cloudinaryId')
    .notEmpty().withMessage('⚠️ cloudinaryId de imagen requerido.'),

  body('images.*.talla')
    .notEmpty().withMessage('⚠️ La talla de la imagen es obligatoria.'),

  body('images.*.color')
    .notEmpty().withMessage('⚠️ El color de la imagen es obligatorio.')
]

/* -------------------------------------------------------------------------- */
/* 🎨 Reglas Comunes para Variantes                                           */
/* -------------------------------------------------------------------------- */
const variantesRules = [
  body('variants')
    .optional()
    .isArray({ max: 4 })
    .withMessage('⚠️ Máximo 4 variantes permitidas.'),

  body('variants.*.talla')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere una talla válida.'),

  body('variants.*.color')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere un color válido.'),

  body('variants.*.imageUrl')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere una imagen.'),

  body('variants.*.cloudinaryId')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere un cloudinaryId.'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('⚠️ El stock de la variante debe ser un número entero ≥ 0.')
]

/* -------------------------------------------------------------------------- */
/* 🆕 Validaciones para CREAR un Producto                                     */
/* -------------------------------------------------------------------------- */
export const createProductValidation = [
  body('name')
    .notEmpty().withMessage('⚠️ El nombre del producto es obligatorio.')
    .isLength({ min: 2 }).withMessage('⚠️ Mínimo 2 caracteres.'),

  body('price')
    .notEmpty().withMessage('⚠️ El precio es obligatorio.')
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
    .isInt({ min: 0 }).withMessage('⚠️ El stock debe ser un número entero ≥ 0.'),

  body('featured')
    .optional()
    .isBoolean().withMessage('⚠️ El campo "featured" debe ser booleano.'),

  body('color')
    .optional()
    .isString().withMessage('⚠️ El color debe ser texto.'),

  ...imagenPrincipalRules,
  ...variantesRules
]

/* -------------------------------------------------------------------------- */
/* ✏️ Validaciones para ACTUALIZAR un Producto                                */
/* -------------------------------------------------------------------------- */
export const updateProductValidation = [
  body('name')
    .optional()
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
    .isInt({ min: 0 }).withMessage('⚠️ El stock debe ser un número entero ≥ 0.'),

  body('featured')
    .optional()
    .isBoolean().withMessage('⚠️ El campo "featured" debe ser booleano.'),

  body('images')
    .optional()
    .isArray().withMessage('⚠️ Images debe ser un arreglo.'),

  // 👇 Adaptar reglas de imagen para uso opcional
  ...imagenPrincipalRules.map(rule => rule.optional()),
  ...variantesRules
]
