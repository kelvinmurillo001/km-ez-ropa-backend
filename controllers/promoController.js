// 📁 backend/controllers/promoController.js
import mongoose from 'mongoose';
import Promotion from '../models/promotion.js';
import config from '../config/configuracionesito.js';
import { validationResult, body } from 'express-validator';

/* ───────────────────────────────────────────── */
/* ✅ VALIDACIONES PARA CREAR / EDITAR PROMOS    */
/* ───────────────────────────────────────────── */
export const validatePromotion = [
  body('message')
    .exists().withMessage('⚠️ El mensaje es requerido.')
    .isString().withMessage('⚠️ El mensaje debe ser texto.')
    .isLength({ min: 3 }).withMessage('⚠️ Mínimo 3 caracteres.')
    .trim(),

  body('active').optional().isBoolean().withMessage('⚠️ "active" debe ser booleano.'),
  body('theme').optional().isString().trim().withMessage('⚠️ "theme" debe ser texto.'),
  body('startDate').optional().isISO8601().toDate().withMessage('⚠️ Fecha de inicio inválida.'),
  body('endDate').optional().isISO8601().toDate().withMessage('⚠️ Fecha de fin inválida.'),

  body().custom(({ startDate, endDate }) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('⚠️ La fecha de inicio no puede ser posterior a la de fin.');
    }
    return true;
  }),

  body('mediaUrl').optional().isURL().withMessage('⚠️ mediaUrl debe ser una URL válida.'),
  body('mediaType').optional().isIn(['image', 'video']).withMessage('⚠️ mediaType debe ser "image" o "video".'),
  body('pages').optional().isArray().withMessage('⚠️ pages debe ser un arreglo.'),
  body('pages.*').optional().isString().withMessage('⚠️ Cada página debe ser texto.'),
  body('position').optional().isIn(['top', 'bottom', 'side']).withMessage('⚠️ position inválido.')
];

/* ───────────────────────────────────────────── */

export const getPromotion = async (_req, res) => {
  try {
    const now = new Date();
    const promos = await Promotion.find({
      active: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    }).select('-__v').sort({ createdAt: -1 }).lean();

    const data = promos.map(p => ({
      id: p._id,
      message: p.message,
      active: p.active,
      theme: p.theme,
      startDate: p.startDate?.toISOString() || null,
      endDate: p.endDate?.toISOString() || null,
      duration: p.startDate && p.endDate
        ? Math.ceil((p.endDate - p.startDate) / (1000 * 60 * 60 * 24))
        : null,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      pages: p.pages,
      position: p.position,
      createdBy: p.createdBy,
      createdAt: p.createdAt?.toISOString() || null
    }));

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('❌ Error al obtener promociones activas:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener promociones activas.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export const getAllPromotions = async (_req, res) => {
  try {
    const promos = await Promotion.find().select('-__v').sort({ createdAt: -1 }).lean();
    return res.status(200).json({ ok: true, data: promos });
  } catch (err) {
    console.error('❌ Error al obtener todas las promociones:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al cargar promociones.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export const updatePromotion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ message: e.msg, field: e.param }))
    });
  }

  try {
    const {
      message,
      active = false,
      theme = config.themeDefault || 'light',
      startDate = null,
      endDate = null,
      mediaUrl = null,
      mediaType = null,
      pages = [],
      position = 'top'
    } = req.body;

    if (active) {
      await Promotion.updateMany({ active: true }, { active: false });
    }

    const promo = new Promotion({
      message: message.trim(),
      active: Boolean(active),
      theme: theme.trim().toLowerCase(),
      startDate,
      endDate,
      mediaUrl,
      mediaType,
      pages: pages.map(p => String(p).trim().toLowerCase()),
      position: position.trim().toLowerCase(),
      createdBy: req.user?.username || 'admin'
    });

    await promo.save();

    if (config.env !== 'production') {
      console.log(`📢 Promoción creada por: ${promo.createdBy}`);
    }

    return res.status(201).json({
      ok: true,
      data: {
        id: promo._id,
        message: promo.message,
        active: promo.active,
        startDate: promo.startDate,
        endDate: promo.endDate
      }
    });
  } catch (err) {
    console.error('❌ Error al guardar promoción:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al guardar promoción.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de promoción inválido.' });
    }

    const result = await Promotion.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ ok: false, message: '❌ Promoción no encontrada.' });
    }

    return res.status(200).json({ ok: true, data: { deletedId: id } });
  } catch (err) {
    console.error('❌ Error al eliminar promoción:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar promoción.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export const togglePromoActive = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de promoción inválido.' });
    }

    const promo = await Promotion.findById(id);
    if (!promo) {
      return res.status(404).json({ ok: false, message: '❌ Promoción no encontrada.' });
    }

    promo.active = !promo.active;
    await promo.save();

    return res.status(200).json({
      ok: true,
      message: `✅ Promoción ${promo.active ? 'activada' : 'desactivada'}.`,
      data: {
        id: promo._id,
        active: promo.active
      }
    });
  } catch (err) {
    console.error('❌ Error al cambiar estado de promoción:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al alternar estado de promoción.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
