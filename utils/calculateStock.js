/**
 * 🧠 Calcula el stock total (stock base + variantes activas)
 * @param {Object} producto - Documento de producto con posibles variantes
 * @returns {number} Stock total calculado
 */
export const calcularStockTotal = (producto = {}) => {
  // 🔢 Stock base
  const stockBase = Number.isFinite(producto.stock) ? producto.stock : 0;

  // 🧬 Stock por variantes activas
  const stockVariantes = Array.isArray(producto.variants)
    ? producto.variants.reduce((total, variante) => {
        const esActiva = variante?.isActive !== false; // default true si no está definido
        const cantidad = Number.isFinite(variante?.stock) ? variante.stock : 0;
        return esActiva ? total + cantidad : total;
      }, 0)
    : 0;

  return stockBase + stockVariantes;
};
