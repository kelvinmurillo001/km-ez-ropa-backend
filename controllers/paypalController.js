// 📁 backend/controllers/paypalController.js
import config from '../config/configuracionesito.js';
import { crearOrden, capturarOrden } from '../services/paypalService.js';
import { validationResult, body } from 'express-validator';

/* ───────────────────────────────────────────── */
/* ✅ VALIDACIONES PAYPAL                        */
/* ───────────────────────────────────────────── */
export const validateCreateOrder = [
  body('total')
    .exists().withMessage('⚠️ El total es requerido.')
    .isFloat({ gt: 0 }).withMessage('⚠️ El total debe ser un número mayor a 0.')
];

export const validateCaptureOrder = [
  body('orderId')
    .exists().withMessage('⚠️ orderId es requerido.')
    .isString().withMessage('⚠️ orderId debe ser texto.')
    .isLength({ min: 5 }).withMessage('⚠️ orderId muy corto.')
];

/* ───────────────────────────────────────────── */
/* 🛒 CREAR ORDEN PAYPAL                         */
/* ───────────────────────────────────────────── */
export const createOrderController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('❌ Errores en crear orden PayPal:', errors.array());
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }

  try {
    const total = parseFloat(req.body.total);
    if (config.env !== 'production') {
      console.log(`💳 Creando orden PayPal por $${total}...`);
    }

    const orden = await crearOrden(total);

    if (!orden?.id) {
      console.warn('⚠️ Fallo al crear orden en PayPal:', orden?.message);
      return res.status(502).json({
        ok: false,
        message: '⚠️ No se pudo crear la orden en PayPal.',
        ...(config.env !== 'production' && { error: orden?.message || 'Sin detalle' })
      });
    }

    return res.status(200).json({ ok: true, data: orden });
  } catch (err) {
    console.error('❌ Error en createOrderController:', err.response?.data || err.message);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear la orden de PayPal.',
      ...(config.env !== 'production' && { error: err.response?.data || err.message })
    });
  }
};

/* ───────────────────────────────────────────── */
/* 💵 CAPTURAR ORDEN PAYPAL                      */
/* ───────────────────────────────────────────── */
export const captureOrderController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('❌ Errores en captura de orden PayPal:', errors.array());
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }

  try {
    const orderId = req.body.orderId.trim();
    if (config.env !== 'production') {
      console.log(`💳 Capturando orden PayPal con ID: ${orderId}`);
    }

    const captura = await capturarOrden(orderId);

    if (!captura || captura?.status?.toUpperCase() !== 'COMPLETED') {
      console.warn('⚠️ Captura incompleta o fallida:', captura?.status || captura);
      return res.status(502).json({
        ok: false,
        message: '⚠️ La captura de la orden no fue exitosa.',
        ...(config.env !== 'production' && { raw: captura })
      });
    }

    return res.status(200).json({ ok: true, data: captura });
  } catch (err) {
    console.error('❌ Error en captureOrderController:', err.response?.data || err.message);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al capturar la orden de PayPal.',
      ...(config.env !== 'production' && { error: err.response?.data || err.message })
    });
  }
};
