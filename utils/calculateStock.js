// 📁 backend/utils/calculateStock.js

/**
 * 🧠 Calcula el stock total (stock base + variantes activas)
 * @param {Object} producto - Documento de producto con posibles variantes
 * @returns {number} Stock total calculado
 */
export const calcularStockTotal = (producto = {}) => {
  if (typeof producto !== 'object' || producto === null) {
    console.warn('⚠️ calcularStockTotal recibió un argumento no válido:', producto);
    return 0;
  }

  // 🔢 Stock general (para productos sin variantes)
  const stockBase = Number.isFinite(producto.stock) ? producto.stock : 0;

  // 🧬 Sumar variantes activas únicamente
  const stockVariantes = Array.isArray(producto.variants)
    ? producto.variants.reduce((total, variante) => {
        const activa = variante?.isActive !== false; // Considerar activa si no está definida
        const cantidad = Number.isFinite(variante?.stock) ? variante.stock : 0;
        return activa ? total + cantidad : total;
      }, 0)
    : 0;

  const stockTotal = stockBase + stockVariantes;

  // 🧪 Debug opcional en entorno dev
  if (process.env.NODE_ENV === 'development') {
    console.debug(`🧾 Stock calculado: base=${stockBase}, variantes=${stockVariantes}, total=${stockTotal}`);
  }

  return stockTotal;
};
