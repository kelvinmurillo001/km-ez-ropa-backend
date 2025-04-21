const Category = require('../models/category');

/**
 * 📥 Obtener todas las categorías
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return res.status(500).json({ message: '❌ Error al obtener las categorías' });
  }
};

/**
 * ➕ Crear nueva categoría (con o sin subcategoría)
 */
const createCategory = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const subcategory = req.body.subcategory?.trim();

    if (!name || name.length < 2) {
      return res.status(400).json({
        message: '⚠️ El nombre de la categoría es obligatorio y debe tener al menos 2 caracteres'
      });
    }

    const exists = await Category.findOne({
      name: new RegExp(`^${name}$`, 'i')
    });

    if (exists) {
      return res.status(400).json({ message: '⚠️ La categoría ya existe' });
    }

    const nuevaCategoria = new Category({
      name: name.toLowerCase(),
      subcategories: subcategory ? [subcategory] : []
    });

    await nuevaCategoria.save();
    return res.status(201).json(nuevaCategoria);

  } catch (error) {
    console.error('❌ Error creando categoría:', error);
    return res.status(500).json({ message: '❌ Error al crear la categoría' });
  }
};

/**
 * ➕ Agregar subcategoría a categoría existente
 */
const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategory = req.body.subcategory?.trim();

    if (!subcategory || subcategory.length < 2) {
      return res.status(400).json({
        message: '⚠️ La subcategoría es obligatoria y debe tener al menos 2 caracteres'
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: '❌ Categoría no encontrada' });
    }

    const alreadyExists = category.subcategories.some(
      sc => sc.toLowerCase() === subcategory.toLowerCase()
    );

    if (alreadyExists) {
      return res.status(400).json({ message: '⚠️ La subcategoría ya existe en esta categoría' });
    }

    category.subcategories.push(subcategory);
    await category.save();

    return res.status(200).json({
      message: '✅ Subcategoría agregada correctamente',
      category
    });

  } catch (error) {
    console.error('❌ Error agregando subcategoría:', error);
    return res.status(500).json({ message: '❌ Error al agregar la subcategoría' });
  }
};

/**
 * 🗑️ Eliminar categoría completa por ID
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: '❌ Categoría no encontrada' });
    }

    await category.deleteOne();
    return res.status(200).json({ message: '✅ Categoría eliminada correctamente' });

  } catch (error) {
    console.error('❌ Error eliminando categoría:', error);
    return res.status(500).json({ message: '❌ Error al eliminar la categoría' });
  }
};

/**
 * 🗑️ Eliminar subcategoría específica de una categoría
 */
const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategory } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: '❌ Categoría no encontrada' });
    }

    const index = category.subcategories.findIndex(
      sc => sc.toLowerCase() === subcategory.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ message: '❌ Subcategoría no encontrada' });
    }

    category.subcategories.splice(index, 1);
    await category.save();

    return res.status(200).json({
      message: '✅ Subcategoría eliminada correctamente',
      category
    });

  } catch (error) {
    console.error('❌ Error eliminando subcategoría:', error);
    return res.status(500).json({ message: '❌ Error al eliminar la subcategoría' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
};
