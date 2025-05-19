// 📁 backend/controllers/categoryController.js
import mongoose from 'mongoose';
import Category from '../models/category.js';
import logger from '../utils/logger.js';

/* ───────────────────────────────────────────── */
/* 📥 GET /api/categories — Público              */
/* ───────────────────────────────────────────── */
export const getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().select('-__v').sort({ name: 1 }).lean();
    return res.status(200).json({ ok: true, data: categories });
  } catch (err) {
    logger.error('❌ Error al obtener categorías:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener categorías.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
    });
  }
};

/* ───────────────────────────────────────────── */
/* ➕ POST /api/categories — Admin                */
/* ───────────────────────────────────────────── */
export const createCategory = async (req, res) => {
  try {
    const nameRaw = String(req.body.name || '').trim().toLowerCase();
    const subRaw = String(req.body.subcategory || '').trim().toLowerCase();

    const isValid = /^[a-záéíóúüñ0-9\s]{2,50}$/i.test(nameRaw);
    if (!isValid) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El nombre debe tener entre 2 y 50 caracteres válidos (sin símbolos especiales).',
      });
    }

    const exists = await Category.findOne({ name: nameRaw }).lean();
    if (exists) {
      return res.status(409).json({ ok: false, message: '⚠️ La categoría ya existe.' });
    }

    const newCategory = await Category.create({
      name: nameRaw,
      subcategories: subRaw ? [subRaw] : [],
    });

    return res.status(201).json({ ok: true, data: newCategory });
  } catch (err) {
    logger.error('❌ Error creando categoría:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear categoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
    });
  }
};

/* ───────────────────────────────────────────── */
/* ➕ POST /api/categories/:id/subcategories — Admin */
/* ───────────────────────────────────────────── */
export const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subRaw = String(req.body.subcategory || '').trim().toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de categoría inválido.' });
    }

    const isValid = /^[a-záéíóúüñ0-9\s]{2,50}$/i.test(subRaw);
    if (!isValid) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Subcategoría inválida. Debe tener entre 2 y 50 caracteres.',
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada.' });
    }

    if (category.subcategories.includes(subRaw)) {
      return res.status(409).json({ ok: false, message: '⚠️ Subcategoría ya existe.' });
    }

    category.subcategories.push(subRaw);
    await category.save();

    return res.status(200).json({ ok: true, data: category });
  } catch (err) {
    logger.error('❌ Error agregando subcategoría:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al agregar subcategoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
    });
  }
};

/* ───────────────────────────────────────────── */
/* 🗑️ DELETE /api/categories/:id — Admin         */
/* ───────────────────────────────────────────── */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID inválido.' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada.' });
    }

    await category.deleteOne();
    return res.status(200).json({ ok: true, message: '✅ Categoría eliminada correctamente.' });
  } catch (err) {
    logger.error('❌ Error eliminando categoría:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar categoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
    });
  }
};

/* ───────────────────────────────────────────── */
/* 🗑️ DELETE /api/categories/:id/subcategories/:subcategory */
/* ───────────────────────────────────────────── */
export const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategory } = req.params;
    const subRaw = String(subcategory || '').trim().toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de categoría inválido.' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada.' });
    }

    const index = category.subcategories.indexOf(subRaw);
    if (index === -1) {
      return res.status(404).json({ ok: false, message: '❌ Subcategoría no encontrada.' });
    }

    category.subcategories.splice(index, 1);
    await category.save();

    return res.status(200).json({ ok: true, data: category });
  } catch (err) {
    logger.error('❌ Error eliminando subcategoría:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar subcategoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
    });
  }
};
