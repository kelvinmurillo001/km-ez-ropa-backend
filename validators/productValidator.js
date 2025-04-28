// 📁 backend/validators/productValidator.js

import { body } from 'express-validator';

/**
 * ➕ Validaciones para crear un nuevo producto
 */
export const createProductValidation = [
  body('name')
    .notEmpty()
    .withMessage('⚠️ El nombre del producto es obligatorio.')
    .isLength({ min: 2 })
    .withMessage('⚠️ El nombre debe tener al menos 2 caracteres.'),

  body('price')
    .notEmpty()
    .withMessage('⚠️ El precio es obligatorio.')
    .isFloat({ gt: 0 })
    .withMessage('⚠️ El precio debe ser un número mayor a 0.'),

  body('category')
    .notEmpty()
    .withMessage('⚠️ La categoría es obligatoria.'),

  body('subcategory')
    .notEmpty()
    .withMessage('⚠️ La subcategoría es obligatoria.'),

  body('tallaTipo')
    .notEmpty()
    .withMessage('⚠️ El tipo de talla es obligatorio.'),

  body('images')
    .isArray({ min: 1, max: 1 })
    .withMessage('⚠️ Debes enviar una imagen principal (array con 1 objeto).'),

  body('createdBy')
    .notEmpty()
    .withMessage('⚠️ El campo createdBy es obligatorio.')
];

/**
 * ✏️ Validaciones para actualizar un producto existente
 */
export const updateProductValidation = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('⚠️ Nombre demasiado corto.'),

  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('⚠️ El precio debe ser positivo.'),

  body('category')
    .optional()
    .isString()
    .withMessage('⚠️ Categoría inválida.'),

  body('subcategory')
    .optional()
    .isString()
    .withMessage('⚠️ Subcategoría inválida.'),

  body('tallaTipo')
    .optional()
    .isString()
    .withMessage('⚠️ Tipo de talla inválido.'),

  body('color')
    .optional()
    .isString()
    .withMessage('⚠️ Color inválido.'),

  body('sizes')
    .optional()
    .isArray()
    .withMessage('⚠️ Sizes debe ser un arreglo.'),

  body('variants')
    .optional()
    .isArray()
    .withMessage('⚠️ Variants debe ser un arreglo.'),

  body('images')
    .optional()
    .isArray()
    .withMessage('⚠️ Images debe ser un arreglo.')
];
