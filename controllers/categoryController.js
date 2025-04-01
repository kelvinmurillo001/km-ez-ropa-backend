// controllers/categoryController.js
const Category = require('../models/category');

// 📥 Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// ➕ Create new category
const createCategory = async (req, res) => {
  // ...
};

// ➕ Add subcategory
const addSubcategory = async (req, res) => {
  // ...
};

// ❌ Delete category
const deleteCategory = async (req, res) => {
  // ...
};

// ❌ Delete subcategory
const deleteSubcategory = async (req, res) => {
  // ...
};

module.exports = {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
};
