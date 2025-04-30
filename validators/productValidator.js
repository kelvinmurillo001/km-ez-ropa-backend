// 📁 backend/validators/productValidator.js
import { body } from 'express-validator'

/**
 * ➕ Validaciones para crear un nuevo producto
 */
export const createProductValidation = [
  body('name')
    .notEmpty().withMessage('⚠️ El nombre del producto es obligatorio.')
    .isLength({ min: 2 }).withMessage('⚠️ El nombre debe tener al menos 2 caracteres.'),

  body('price')
    .notEmpty().withMessage('⚠️ El precio es obligatorio.')
    .isFloat({ gt: 0 }).withMessage('⚠️ El precio debe ser un número mayor a 0.'),

  body('category')
    .notEmpty().withMessage('⚠️ La categoría es obligatoria.'),

  body('subcategory')
    .notEmpty().withMessage('⚠️ La subcategoría es obligatoria.'),

  body('tallaTipo')
    .notEmpty().withMessage('⚠️ El tipo de talla es obligatorio.'),

  body('images')
    .isArray({ min: 1, max: 1 }).withMessage('⚠️ Debes enviar una imagen principal (array con 1 objeto).'),

  body('images.*.url')
    .notEmpty().withMessage('⚠️ La imagen principal necesita una URL válida.'),

  body('images.*.cloudinaryId')
    .notEmpty().withMessage('⚠️ cloudinaryId de imagen requerido.'),

  body('images.*.talla')
    .notEmpty().withMessage('⚠️ La talla de la imagen es obligatoria.'),

  body('images.*.color')
    .notEmpty().withMessage('⚠️ El color de la imagen es obligatorio.'),

  body('createdBy')
    .notEmpty().withMessage('⚠️ El campo createdBy es obligatorio.'),

  body('variants')
    .optional()
    .isArray({ max: 4 }).withMessage('⚠️ Máximo 4 variantes permitidas.'),

  body('variants.*.talla')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere una talla.'),

  body('variants.*.color')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere un color.'),

  body('variants.*.imageUrl')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere una imagen.'),

  body('variants.*.cloudinaryId')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere un cloudinaryId.'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 }).withMessage('⚠️ El stock de cada variante debe ser un número entero ≥ 0.')
]

/**
 * ✏️ Validaciones para actualizar un producto existente
 */
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

  body('variants')
    .optional()
    .isArray({ max: 4 }).withMessage('⚠️ Máximo 4 variantes permitidas.'),

  body('variants.*.talla')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere una talla.'),

  body('variants.*.color')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere un color.'),

  body('variants.*.imageUrl')
    .optional()
    .notEmpty().withMessage('⚠️ Cada variante requiere una imagen.'),

  body('variants.*.cloudinaryId')
    .optional()
    .notEmpty().withMessage('⚠️ cloudinaryId requerido en la variante.'),

  body('variants.*.stock')
    .optional()
    .isInt({ min: 0 }).withMessage('⚠️ El stock de la variante debe ser un número ≥ 0.'),

  body('images')
    .optional()
    .isArray().withMessage('⚠️ Images debe ser un arreglo.')
]
