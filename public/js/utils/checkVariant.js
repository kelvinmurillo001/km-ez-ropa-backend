/**
 * ✅ Valida si una variante de talla y color está disponible.
 * @param {Array} variants - Lista de variantes disponibles del producto.
 * @param {string} talla - Talla seleccionada.
 * @param {string} color - Color seleccionado.
 * @param {number} cantidad - Cantidad deseada.
 * @returns {Object} { ok: Boolean, variante?: Object, message?: String }
 */
export function validarVariante(variants = [], talla, color, cantidad = 1) {
  // ⚠️ Validaciones básicas
  if (!Array.isArray(variants) || variants.length === 0) {
    return { ok: false, message: "❌ Este producto no tiene variantes registradas." };
  }

  const keyTalla = normalize(talla);
  const keyColor = normalize(color);

  if (!keyTalla || !keyColor) {
    return { ok: false, message: "⚠️ Debes seleccionar una talla y un color válidos." };
  }

  // 🔍 Buscar coincidencia exacta
  const variante = variants.find(
    v => normalize(v.talla) === keyTalla && normalize(v.color) === keyColor
  );

  if (!variante) {
    return { ok: false, message: `❌ Variante no encontrada: ${talla} - ${color}` };
  }

  if (variante.activo === false) {
    return { ok: false, message: `❌ Variante inactiva: ${talla} - ${color}` };
  }

  if (typeof cantidad !== "number" || cantidad <= 0) {
    return { ok: false, message: "⚠️ La cantidad debe ser mayor a 0." };
  }

  if (typeof variante.stock !== "number" || variante.stock < cantidad) {
    return {
      ok: false,
      message: `❌ No hay suficiente stock disponible para ${talla} - ${color}.`
    };
  }

  return { ok: true, variante };
}

/**
 * 🔠 Normaliza texto eliminando espacios y convirtiendo a minúsculas
 * @param {string} str
 * @returns {string}
 */
function normalize(str = "") {
  return String(str).trim().toLowerCase();
}
