// 📁 backend/validators/filtroProductosValidator.js
import { query } from 'express-validator';

export const filtroProductosValidator = [
  // 📄 Paginación
  query('pagina')
    .optional()
    .isInt({ min: 1 }).withMessage('⚠️ La página debe ser un número positivo'),

  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('⚠️ El límite debe estar entre 1 y 100'),

  // 💰 Filtro de precios
  query('precioMin')
    .optional()
    .isFloat({ min: 0 }).withMessage('⚠️ Precio mínimo inválido'),

  query('precioMax')
    .optional()
    .isFloat({ min: 0 }).withMessage('⚠️ Precio máximo inválido')
    .custom((value, { req }) => {
      const min = parseFloat(req.query.precioMin);
      const max = parseFloat(value);
      if (!isNaN(min) && max < min) {
        throw new Error('⚠️ El precio máximo debe ser mayor o igual al mínimo');
      }
      return true;
    }),

  // 🔍 Filtros de texto
  query('nombre')
    .optional()
    .isString().withMessage('⚠️ El nombre debe ser texto')
    .trim().isLength({ min: 2 }).withMessage('⚠️ El nombre debe tener al menos 2 caracteres'),

  query('categoria')
    .optional()
    .isString().withMessage('⚠️ La categoría debe ser texto')
    .trim().toLowerCase(),

  query('subcategoria')
    .optional()
    .isString().withMessage('⚠️ La subcategoría debe ser texto')
    .trim().toLowerCase(),

  // 🌟 Bools
  query('featured')
    .optional()
    .isBoolean().withMessage('⚠️ featured debe ser booleano')
    .toBoolean(),

  query('conStock')
    .optional()
    .isBoolean().withMessage('⚠️ conStock debe ser booleano')
    .toBoolean()
];
