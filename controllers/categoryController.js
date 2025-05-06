// 📁 backend/controllers/categoryController.js
import mongoose from 'mongoose'
import Category from '../models/category.js'

/**
 * 📥 Obtener todas las categorías
 * @route   GET /api/categories
 * @access  Público
 */
export const getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find()
      .select('-__v')
      .sort({ name: 1 })
      .lean()

    return res.status(200).json({ ok: true, data: categories })
  } catch (err) {
    console.error('❌ Error al obtener categorías:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener categorías.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}

/**
 * ➕ Crear nueva categoría
 * @route   POST /api/categories
 * @access  Admin
 */
export const createCategory = async (req, res) => {
  try {
    const nameRaw = String(req.body.name || '').trim().toLowerCase()
    const subRaw = String(req.body.subcategory || '').trim().toLowerCase()

    if (nameRaw.length < 2) {
      return res.status(400).json({ ok: false, message: '⚠️ El nombre debe tener al menos 2 caracteres.' })
    }

    const exists = await Category.findOne({ name: nameRaw }).lean()
    if (exists) {
      return res.status(409).json({ ok: false, message: '⚠️ La categoría ya existe.' })
    }

    const category = await Category.create({
      name: nameRaw,
      subcategories: subRaw ? [subRaw] : []
    })

    return res.status(201).json({ ok: true, data: category })
  } catch (err) {
    console.error('❌ Error creando categoría:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear categoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}

/**
 * ➕ Agregar subcategoría
 * @route   POST /api/categories/:categoryId/subcategories
 * @access  Admin
 */
export const addSubcategory = async (req, res) => {
  try {
    const categoryId = String(req.params.categoryId || '').trim()
    const subRaw = String(req.body.subcategory || '').trim().toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de categoría inválido.' })
    }

    if (subRaw.length < 2) {
      return res.status(400).json({ ok: false, message: '⚠️ Subcategoría inválida (mínimo 2 caracteres).' })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada.' })
    }

    if (category.subcategories.includes(subRaw)) {
      return res.status(409).json({ ok: false, message: '⚠️ Subcategoría ya existe en esta categoría.' })
    }

    category.subcategories.push(subRaw)
    await category.save()

    return res.status(200).json({ ok: true, data: category })
  } catch (err) {
    console.error('❌ Error agregando subcategoría:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al agregar subcategoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}

/**
 * 🗑️ Eliminar una categoría
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim()
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID inválido.' })
    }

    const category = await Category.findById(id)
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada.' })
    }

    await category.deleteOne()
    return res.status(200).json({ ok: true, message: '✅ Categoría eliminada.' })
  } catch (err) {
    console.error('❌ Error eliminando categoría:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar categoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}

/**
 * 🗑️ Eliminar subcategoría específica
 * @route   DELETE /api/categories/:categoryId/subcategories/:subcategory
 * @access  Admin
 */
export const deleteSubcategory = async (req, res) => {
  try {
    const categoryId = String(req.params.categoryId || '').trim()
    const subRaw = String(req.params.subcategory || '').trim().toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de categoría inválido.' })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada.' })
    }

    const index = category.subcategories.indexOf(subRaw)
    if (index === -1) {
      return res.status(404).json({ ok: false, message: '❌ Subcategoría no encontrada.' })
    }

    category.subcategories.splice(index, 1)
    await category.save()

    return res.status(200).json({ ok: true, data: category })
  } catch (err) {
    console.error('❌ Error eliminando subcategoría:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar subcategoría.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}
