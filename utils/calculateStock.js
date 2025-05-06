// 📁 backend/utils/calculateStock.js

/**
 * 🧠 Calcula el stock total (stock base + variantes activas)
 * @param {Object} producto - Documento de producto con posibles variantes
 * @returns {number} Stock total calculado
 */
export const calcularStockTotal = (producto = {}) => {
  const stockBase = Number.isFinite(producto.stock) ? producto.stock : 0;

  const stockVariantes = Array.isArray(producto.variants)
    ? producto.variants.reduce((acc, v) => {
        const activo = v?.activo !== false;
        const stock = Number.isFinite(v?.stock) ? v.stock : 0;
        return activo ? acc + stock : acc;
      }, 0)
    : 0;

  return stockBase + stockVariantes;
};
