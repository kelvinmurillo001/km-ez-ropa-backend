// controllers/categoryController.js
const Category = require('../models/category');

// 📥 Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// ➕ Crear nueva categoría
const createCategory = async (req, res) => {
  try {
    const { name, subcategory } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
    }

    // Buscar si ya existe
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    const nuevaCategoria = new Category({
      name,
      subcategories: subcategory ? [subcategory] : []
    });

    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error('❌ Error creando categoría:', error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// ➕ Agregar subcategoría
const addSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { subcategory } = req.body;

    if (!subcategory) {
      return res.status(400).json({ message: 'La subcategoría es obligatoria' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    if (category.subcategories.includes(subcategory)) {
      return res.status(400).json({ message: 'La subcategoría ya existe' });
    }

    category.subcategories.push(subcategory);
    await category.save();
    res.json(category);
  } catch (error) {
    console.error('❌ Error agregando subcategoría:', error);
    res.status(500).json({ message: 'Error al agregar la subcategoría' });
  }
};

// ❌ Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await category.deleteOne();
    res.json({ message: '✅ Categoría eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando categoría:', error);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};

// ❌ Eliminar subcategoría específica
const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategory } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const index = category.subcategories.indexOf(subcategory);
    if (index === -1) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }

    category.subcategories.splice(index, 1);
    await category.save();

    res.json({ message: '✅ Subcategoría eliminada correctamente', category });
  } catch (error) {
    console.error('❌ Error eliminando subcategoría:', error);
    res.status(500).json({ message: 'Error al eliminar la subcategoría' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
};
