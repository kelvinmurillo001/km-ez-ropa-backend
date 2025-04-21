const Product = require('../../models/Product');

/**
 * 📥 Obtener todos los productos (para catálogo o panel)
 * ✅ Filtros disponibles:
 * - nombre: búsqueda parcial (no sensible a mayúsculas)
 * - categoria: filtro exacto
 * - subcategoria: filtro exacto
 * - precioMin y precioMax: filtro por rango de precio
 *
 * Ejemplo: /api/products?nombre=jeans&categoria=hombres&precioMin=20&precioMax=80
 */
const getAllProducts = async (req, res) => {
  try {
    const { nombre, categoria, subcategoria, precioMin, precioMax } = req.query;

    const filtro = {
      name: { $exists: true, $ne: "" },
      price: { $exists: true, $gt: 0 }
    };

    // 🔍 Filtro por nombre (búsqueda insensible a mayúsculas)
    if (nombre?.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), "i") };
    }

    // 🎯 Filtro por categoría exacta
    if (categoria?.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }

    // 🧩 Filtro por subcategoría exacta
    if (subcategoria?.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    // 💰 Filtro por rango de precio
    const min = parseFloat(precioMin);
    const max = parseFloat(precioMax);

    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {};
      if (!isNaN(min)) filtro.price.$gte = min;
      if (!isNaN(max)) filtro.price.$lte = max;
    }

    // 🔄 Consulta a la base de datos
    const productos = await Product.find(filtro)
      .sort({ createdAt: -1 }) // 🕒 Ordenar por más recientes
      .lean(); // ⚡ Consultar sin métodos Mongoose

    console.log(`✅ Productos encontrados: ${productos.length}`, filtro);

    return res.status(200).json(productos);

  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    return res.status(500).json({
      message: '❌ Error interno al obtener productos',
      error: error.message
    });
  }
};

module.exports = getAllProducts;
