import { body, param } from 'express-validator'

export const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('⚠️ El pedido debe contener al menos un producto.'),

  body('total')
    .isFloat({ min: 0.01 })
    .withMessage('⚠️ El total debe ser un número mayor a 0.'),

  body('nombreCliente')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('⚠️ El nombre del cliente es obligatorio.')
    .isLength({ min: 2 })
    .withMessage('⚠️ Mínimo 2 caracteres.'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('⚠️ Email inválido.')
    .normalizeEmail(),

  body('telefono')
    .optional()
    .isString()
    .withMessage('⚠️ El teléfono debe ser texto.')
    .isLength({ min: 7, max: 20 })
    .withMessage('⚠️ Teléfono inválido.'),

  body('nota')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('⚠️ La nota debe ser texto válido.')
    .isLength({ max: 300 })
    .withMessage('⚠️ Nota demasiado larga.'),

  body('direccion')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('⚠️ Dirección inválida.')
    .isLength({ min: 5, max: 300 })
    .withMessage('⚠️ Dirección muy corta o muy larga.'),

  body('metodoPago')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('⚠️ Método de pago inválido.')
    .isLength({ min: 3, max: 50 }),

  body('estado')
    .optional()
    .trim()
    .escape()
    .isString()
    .isLength({ min: 3, max: 20 }),

  body('factura')
    .optional()
    .isObject()
    .withMessage('⚠️ Datos de factura inválidos.')
]

export const updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID de pedido inválido.'),

  body('estado')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('⚠️ El estado es obligatorio.')
    .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado'])
    .withMessage('⚠️ Estado no válido.')
]
