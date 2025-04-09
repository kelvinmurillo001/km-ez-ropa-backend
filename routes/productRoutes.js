const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

/**
 * 📥 Obtener todos los productos
 */
const getAllProducts = async (req, res) => {
  try {
    const productos = await Product.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    res.status(500).json({ message: 'Error del servidor al obtener productos' });
  }
};

/**
 * ➕ Crear nuevo producto
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      subcategory,
      stock,
      featured,
      variants,
      mainImages
    } = req.body;

    if (!name || !price || !category || !subcategory || !variants || !mainImages) {
      return res.status(400).json({ message: '⚠️ Campos obligatorios incompletos' });
    }

    const processedVariants = variants.map(v => {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;
      if (!talla || !color || !imageUrl || !cloudinaryId) {
        throw new Error('Cada variante requiere talla, color, imageUrl y cloudinaryId');
      }
      return {
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0
      };
    });

    const processedImages = mainImages.map(img => {
      if (!img.url || !img.public_id) {
        throw new Error('Cada imagen principal requiere url y public_id');
      }
      return {
        url: img.url,
        cloudinaryId: img.public_id
      };
    });

    const createdBy = req.user?.username || 'admin';

    const nuevoProducto = new Product({
      name,
      price,
      category,
      subcategory,
      stock,
      featured: featured === true || featured === 'true',
      variants: processedVariants,
      images: processedImages,
      createdBy
    });

    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('❌ Error creando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
};

/**
 * ✏️ Actualizar producto
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      category,
      subcategory,
      stock,
      featured,
      variants,
      mainImages
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // 🧼 Eliminar imágenes anteriores en Cloudinary (variantes e imágenes principales)
    for (const v of product.variants) {
      if (v.cloudinaryId) {
        await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }
    for (const img of product.images) {
      if (img.cloudinaryId) {
        await cloudinary.uploader.destroy(img.cloudinaryId);
      }
    }

    const processedVariants = Array.isArray(variants)
      ? variants.map(v => {
          const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;
          if (!talla || !color || !imageUrl || !cloudinaryId) {
            throw new Error('Cada variante requiere talla, color, imageUrl y cloudinaryId');
          }
          return {
            talla,
            color,
            imageUrl,
            cloudinaryId,
            stock: variantStock || 0
          };
        })
      : [];

    const processedImages = Array.isArray(mainImages)
      ? mainImages.map(img => {
          if (!img.url || !img.public_id) {
            throw new Error('Cada imagen principal requiere url y public_id');
          }
          return {
            url: img.url,
            cloudinaryId: img.public_id
          };
        })
      : [];

    // 🛠️ Actualizar campos
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.stock = stock ?? product.stock;
    product.featured = featured === true || featured === 'true';
    product.variants = processedVariants;
    product.images = processedImages;
    product.updatedBy = req.user?.username || 'admin';

    const actualizado = await product.save();
    res.json(actualizado);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error del servidor al actualizar' });
  }
};

/**
 * 🗑️ Eliminar producto y sus imágenes asociadas
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // 🧹 Eliminar imágenes de variantes
    for (const v of product.variants) {
      if (v.cloudinaryId) {
        await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    // 🧹 Eliminar imágenes principales
    for (const img of product.images) {
      if (img.cloudinaryId) {
        await cloudinary.uploader.destroy(img.cloudinaryId);
      }
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error.message);
    res.status(500).json({ message: 'Error del servidor al eliminar producto' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
