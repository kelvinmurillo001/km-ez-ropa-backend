// 📁 backend/validators/filtroProductosValidator.js

import { query } from 'express-validator'

export const filtroProductosValidator = [
  // 📄 Paginación: página actual
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('⚠️ La página debe ser un número positivo'),

  // 📄 Límite de resultados por página
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('⚠️ El límite debe estar entre 1 y 100'),

  // 💰 Filtro de precio mínimo
  query('precioMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('⚠️ Precio mínimo inválido'),

  // 💰 Filtro de precio máximo, validación cruzada con mínimo
  query('precioMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('⚠️ Precio máximo inválido')
    .custom((value, { req }) => {
      const min = parseFloat(req.query.precioMin)
      const max = parseFloat(value)
      if (!isNaN(min) && max < min) {
        throw new Error('⚠️ El precio máximo debe ser mayor o igual al mínimo')
      }
      return true
    }),

  // 🔍 Nombre (búsqueda por texto)
  query('nombre')
    .optional()
    .isString().withMessage('⚠️ El nombre debe ser texto')
    .trim(),

  // 🏷️ Filtro por categoría
  query('categoria')
    .optional()
    .isString().withMessage('⚠️ La categoría debe ser texto')
    .trim(),

  // 🏷️ Filtro por subcategoría
  query('subcategoria')
    .optional()
    .isString().withMessage('⚠️ La subcategoría debe ser texto')
    .trim(),

  // 🌟 Filtrar por productos destacados
  query('featured')
    .optional()
    .isBoolean().withMessage('⚠️ featured debe ser booleano')
    .toBoolean(),

  // 📦 Filtrar solo productos con stock
  query('conStock')
    .optional()
    .isBoolean().withMessage('⚠️ conStock debe ser booleano')
    .toBoolean()
]
