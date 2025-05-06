/**
 * ✅ Verifica si una variante específica (talla + color) está disponible y activa
 * @param {Array} variants - Lista de variantes del producto
 * @param {String} talla - Talla solicitada
 * @param {String} color - Color solicitado
 * @param {Number} cantidad - Cantidad solicitada
 * @returns {Object} - { ok: boolean, variante?, message? }
 */
export function checkVariantDisponible(variants = [], talla, color, cantidad = 1) {
  if (!Array.isArray(variants)) {
    return { ok: false, message: '❌ Lista de variantes no válida.' }
  }

  const keyTalla = String(talla || '').toLowerCase().trim()
  const keyColor = String(color || '').toLowerCase().trim()
  const cant = Number(cantidad)

  if (!keyTalla || !keyColor) {
    return { ok: false, message: '⚠️ Talla y color son requeridos.' }
  }

  if (!Number.isFinite(cant) || cant <= 0) {
    return { ok: false, message: '⚠️ Cantidad solicitada inválida.' }
  }

  const variante = variants.find(
    v => v.talla === keyTalla && v.color === keyColor
  )

  if (!variante) {
    return {
      ok: false,
      message: `❌ Variante no encontrada: ${talla} - ${color}`
    }
  }

  if (variante.activo === false) {
    return {
      ok: false,
      message: `❌ Variante inactiva: ${talla} - ${color}`
    }
  }

  if (!Number.isFinite(variante.stock) || variante.stock < cant) {
    return {
      ok: false,
      message: `❌ Stock insuficiente para ${talla} - ${color}`
    }
  }

  return { ok: true, variante }
}

/**
 * 🚨 Verifica si un producto está totalmente agotado
 * Si todas las variantes están inactivas o sin stock
 * @param {Array} variants - Lista de variantes del producto
 * @returns {Boolean}
 */
export function verificarProductoAgotado(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return true

  return variants.every(v =>
    v?.activo === false ||
    !Number.isFinite(v?.stock) ||
    v.stock <= 0
  )
}
