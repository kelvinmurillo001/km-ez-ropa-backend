// 📁 backend/validators/orderValidator.js

import { body, param } from 'express-validator'

/**
 * 🧾 Validaciones para crear un pedido
 */
export const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('⚠️ El pedido debe contener al menos un producto.'),

  body('items.*.productId')
    .isMongoId()
    .withMessage('⚠️ ID de producto inválido.'),

  body('items.*.name')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('⚠️ Nombre del producto inválido.'),

  body('items.*.talla')
    .isString()
    .trim()
    .withMessage('⚠️ Talla del producto inválida.'),

  body('items.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('⚠️ Cantidad debe ser al menos 1.'),

  body('items.*.precio')
    .isFloat({ min: 0 })
    .withMessage('⚠️ Precio inválido.'),

  body('total')
    .isFloat({ min: 0.01 })
    .withMessage('⚠️ El total debe ser un número mayor a 0.'),

  body('nombreCliente')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('⚠️ El nombre del cliente es obligatorio.')
    .isLength({ min: 2, max: 100 })
    .withMessage('⚠️ El nombre debe tener entre 2 y 100 caracteres.'),

  body('email')
    .notEmpty()
    .withMessage('⚠️ Email es obligatorio.')
    .isEmail()
    .withMessage('⚠️ Email inválido.')
    .normalizeEmail(),

  body('telefono')
    .notEmpty()
    .isString()
    .isLength({ min: 7, max: 20 })
    .withMessage('⚠️ Teléfono inválido.'),

  body('nota')
    .optional()
    .trim()
    .escape()
    .isString()
    .isLength({ max: 300 })
    .withMessage('⚠️ Nota demasiado larga.'),

  body('direccion')
    .notEmpty()
    .withMessage('⚠️ Dirección es obligatoria.')
    .isString()
    .isLength({ min: 5, max: 300 })
    .withMessage('⚠️ Dirección muy corta o muy larga.'),

  body('metodoPago')
    .notEmpty()
    .isString()
    .isIn(['efectivo', 'tarjeta', 'paypal', 'transferencia'])
    .withMessage('⚠️ Método de pago inválido.'),

  body('estado')
    .optional()
    .isString()
    .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'])
    .withMessage('⚠️ Estado inválido.'),

  body('factura')
    .optional()
    .isObject()
    .withMessage('⚠️ Datos de factura inválidos.'),

  body('factura.razonSocial')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('⚠️ Razón social inválida.'),

  body('factura.ruc')
    .optional()
    .isString()
    .isLength({ min: 8, max: 20 })
    .withMessage('⚠️ RUC o cédula inválido.'),

  body('factura.email')
    .optional()
    .isEmail()
    .withMessage('⚠️ Email de facturación inválido.')
    .normalizeEmail()
]

/**
 * 🔄 Validaciones para actualizar estado del pedido
 */
export const updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID de pedido inválido.'),

  body('estado')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('⚠️ El estado es obligatorio.')
    .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'])
    .withMessage('⚠️ Estado no válido.')
]
