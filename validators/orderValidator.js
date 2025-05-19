// 📁 backend/validators/orderValidator.js
import { body, param } from 'express-validator'

/* 🧾 Validaciones para crear un pedido */
export const createOrderValidation = [
  // 🛒 Items del pedido
  body('items')
    .isArray({ min: 1 }).withMessage('⚠️ El pedido debe contener al menos un producto.').bail(),

  body('items.*.productId')
    .isMongoId().withMessage('⚠️ ID de producto inválido.'),

  body('items.*.name')
    .isString().withMessage('⚠️ Nombre de producto faltante.')
    .trim().isLength({ min: 2, max: 100 }).withMessage('⚠️ El nombre del producto debe tener entre 2 y 100 caracteres.'),

  body('items.*.talla')
    .isString().withMessage('⚠️ La talla del producto es requerida.')
    .trim().notEmpty().withMessage('⚠️ La talla no puede estar vacía.'),

  body('items.*.color')
    .isString().trim().notEmpty().withMessage('⚠️ El color es obligatorio.'),

  body('items.*.cantidad')
    .isInt({ min: 1 }).withMessage('⚠️ La cantidad debe ser al menos 1.'),

  body('items.*.precio')
    .isFloat({ min: 0 }).withMessage('⚠️ El precio del producto es inválido.'),

  // 💰 Total
  body('total')
    .isFloat({ min: 0.01 }).withMessage('⚠️ El total debe ser mayor a 0.'),

  // 👤 Datos del cliente
  body('nombreCliente')
    .isString().trim().escape()
    .isLength({ min: 2, max: 100 }).withMessage('⚠️ El nombre debe tener entre 2 y 100 caracteres.'),

  body('email')
    .isEmail().withMessage('⚠️ Email inválido.')
    .normalizeEmail(),

  body('telefono')
    .isString().trim()
    .isLength({ min: 7, max: 20 }).withMessage('⚠️ Teléfono inválido (mínimo 7 caracteres).'),

  body('direccion')
    .isString().trim()
    .isLength({ min: 5, max: 300 }).withMessage('⚠️ Dirección inválida (mínimo 5 caracteres).'),

  // 📝 Otros campos opcionales
  body('nota')
    .optional()
    .isString().trim().escape()
    .isLength({ max: 300 }).withMessage('⚠️ Nota demasiado larga (máx. 300 caracteres).'),

  body('metodoPago')
    .isString().notEmpty()
    .isIn(['efectivo', 'tarjeta', 'paypal', 'transferencia'])
    .withMessage('⚠️ Método de pago inválido. Debe ser: efectivo, tarjeta, paypal o transferencia.'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'])
    .withMessage('⚠️ Estado inválido.'),

  // 🧾 Validación de factura (opcional)
  body('factura')
    .optional()
    .custom(value => typeof value === 'object' && value !== null)
    .withMessage('⚠️ Datos de factura inválidos.'),

  body('factura.razonSocial')
    .optional()
    .isString().trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('⚠️ Razón social inválida (mín. 2 caracteres).'),

  body('factura.ruc')
    .optional()
    .isString().trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('⚠️ RUC o cédula inválido (mín. 8 caracteres).'),

  body('factura.email')
    .optional()
    .isEmail().normalizeEmail()
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
    .withMessage('⚠️ Estado no válido. Elige uno válido: pendiente, en_proceso, enviado, cancelado, pagado.')
]
