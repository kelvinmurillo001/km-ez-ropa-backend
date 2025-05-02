// 📁 backend/utils/calculateStock.js

/**
 * 🧠 Calcula el stock total (base + variantes activas)
 * @param {Object} producto - Documento de producto (con variants)
 * @returns {number} Stock total
 */
export const calcularStockTotal = (producto) => {
    const stockBase = typeof producto.stock === 'number' ? producto.stock : 0
    const stockVariantes = Array.isArray(producto.variants)
      ? producto.variants
          .filter(v => v?.activo !== false)
          .reduce((acc, v) => acc + (v.stock || 0), 0)
      : 0
  
    return stockBase + stockVariantes
  }
  