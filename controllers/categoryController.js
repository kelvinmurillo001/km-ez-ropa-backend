// 📁 backend/controllers/categoryController.js
import Category from '../models/category.js'
import mongoose from 'mongoose'

/**
 * 📥 Obtener todas las categorías ordenadas (público o admin)
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    return res.status(200).json({
      ok: true,
      message: '✅ Categorías obtenidas correctamente',
      data: categories
    })
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener las categorías',
      error: error.message
    })
  }
}

/**
 * ➕ Crear nueva categoría
 */
export const createCategory = async (req, res) => {
  try {
    const name = req.body.name?.trim().toLowerCase()
    const subcategory = req.body.subcategory?.trim().toLowerCase()

    if (!name || name.length < 2) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El nombre de la categoría debe tener al menos 2 caracteres'
      })
    }

    const exists = await Category.findOne({ name })
    if (exists) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ La categoría ya existe'
      })
    }

    const nuevaCategoria = new Category({
      name,
      subcategories: subcategory ? [subcategory] : []
    })

    await nuevaCategoria.save()
    return res.status(201).json({
      ok: true,
      message: '✅ Categoría creada correctamente',
      data: nuevaCategoria
    })
  } catch (error) {
    console.error('❌ Error creando categoría:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear la categoría',
      error: error.message
    })
  }
}

/**
 * ➕ Agregar subcategoría a una categoría existente
 */
export const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params
    const subcategory = req.body.subcategory?.trim().toLowerCase()

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de categoría inválido' })
    }

    if (!subcategory || subcategory.length < 2) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Subcategoría inválida (mínimo 2 caracteres)'
      })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada' })
    }

    if (category.subcategories.includes(subcategory)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Subcategoría ya existente en esta categoría'
      })
    }

    category.subcategories.push(subcategory)
    await category.save()

    return res.status(200).json({
      ok: true,
      message: '✅ Subcategoría agregada correctamente',
      data: category
    })
  } catch (error) {
    console.error('❌ Error agregando subcategoría:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al agregar subcategoría',
      error: error.message
    })
  }
}

/**
 * 🗑️ Eliminar categoría completa
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de categoría inválido' })
    }

    const category = await Category.findById(id)
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada' })
    }

    await category.deleteOne()

    return res.status(200).json({
      ok: true,
      message: '✅ Categoría eliminada correctamente'
    })
  } catch (error) {
    console.error('❌ Error eliminando categoría:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar categoría',
      error: error.message
    })
  }
}

/**
 * 🗑️ Eliminar subcategoría específica
 */
export const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategory } = req.params

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID inválido' })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ ok: false, message: '❌ Categoría no encontrada' })
    }

    const subcatLower = subcategory.trim().toLowerCase()
    const index = category.subcategories.findIndex(sc => sc === subcatLower)

    if (index === -1) {
      return res.status(404).json({ ok: false, message: '❌ Subcategoría no encontrada' })
    }

    category.subcategories.splice(index, 1)
    await category.save()

    return res.status(200).json({
      ok: true,
      message: '✅ Subcategoría eliminada correctamente',
      data: category
    })
  } catch (error) {
    console.error('❌ Error eliminando subcategoría:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar subcategoría',
      error: error.message
    })
  }
}
