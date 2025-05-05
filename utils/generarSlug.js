/**
 * 🔤 Generar un slug limpio y único a partir de texto
 * @param {string} texto - El texto base (ej: nombre del producto)
 * @returns {string} Slug en formato kebab-case
 */
const generarSlug = (texto = '') => {
    if (typeof texto !== 'string') return ''
  
    return texto
      .toLowerCase()
      .normalize('NFD')                      // Elimina tildes
      .replace(/[\u0300-\u036f]/g, '')       // Elimina caracteres diacríticos
      .replace(/ñ/g, 'n')                    // Reemplazo especial para español
      .replace(/[^a-z0-9\s-]/g, '')          // Quita símbolos especiales
      .trim()
      .replace(/\s+/g, '-')                  // Espacios a guiones
      .replace(/-+/g, '-')                   // Guiones múltiples a uno solo
      .substring(0, 100)                     // Limita la longitud del slug
  }
  
  export default generarSlug
  