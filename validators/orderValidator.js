// 📁 backend/validators/orderValidator.js

import { body, param } from 'express-validator'

/* 🧾 Validaciones para crear un pedido */
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
    .isLength({ min: 2, max: 100 })
    .withMessage('⚠️ Nombre del producto inválido.'),

  body('items.*.talla')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('⚠️ Talla del producto requerida.'),

  body('items.*.color')
    .optional()
    .isString()
    .trim(),

  body('items.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('⚠️ Cantidad debe ser al menos 1.'),

  body('items.*.precio')
    .isFloat({ min: 0 })
    .withMessage('⚠️ Precio inválido.'),

  body('total')
    .isFloat({ min: 0.01 })
    .withMessage('⚠️ El total debe ser mayor a 0.'),

  body('nombreCliente')
    .isString()
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage('⚠️ El nombre debe tener entre 2 y 100 caracteres.'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('⚠️ Email inválido.'),

  body('telefono')
    .isString()
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('⚠️ Teléfono inválido.'),

  body('nota')
    .optional()
    .isString()
    .trim()
    .escape()
    .isLength({ max: 300 })
    .withMessage('⚠️ Nota demasiado larga.'),

  body('direccion')
    .isString()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('⚠️ Dirección inválida.'),

  body('metodoPago')
    .isString()
    .notEmpty()
    .isIn(['efectivo', 'tarjeta', 'paypal', 'transferencia'])
    .withMessage('⚠️ Método de pago inválido.'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'])
    .withMessage('⚠️ Estado inválido.'),

  body('factura')
    .optional()
    .isObject()
    .withMessage('⚠️ Datos de factura inválidos.'),

  body('factura.razonSocial')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('⚠️ Razón social inválida.'),

  body('factura.ruc')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('⚠️ RUC o cédula inválido.'),

  body('factura.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('⚠️ Email de facturación inválido.')
]

/* 🔄 Validaciones para actualizar estado del pedido */
export const updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID de pedido inválido.'),

  body('estado')
    .trim()
    .notEmpty()
    .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'])
    .withMessage('⚠️ Estado no válido.')
]
