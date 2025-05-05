import { query } from 'express-validator'

export const filtroProductosValidator = [
  query('pagina').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('Límite entre 1 y 100'),
  query('precioMin').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido'),
  query('precioMax').optional().isFloat({ min: 0 }).withMessage('Precio máximo inválido'),
  query('nombre').optional().isString().trim(),
  query('categoria').optional().isString().trim(),
  query('subcategoria').optional().isString().trim(),
  query('featured').optional().isBoolean()
]
