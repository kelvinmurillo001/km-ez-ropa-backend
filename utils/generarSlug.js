/**
 * 🔤 Genera un slug en formato kebab-case a partir de un texto
 * @param {string} texto - Entrada de texto original
 * @returns {string} - Slug generado (máx. 100 caracteres)
 */
function generarSlug(texto) {
  if (typeof texto !== 'string') return '';

  return texto
    .normalize('NFD')                         // separa acentos de letras
    .replace(/[\u0300-\u036f]/g, '')         // elimina tildes
    .replace(/ñ/g, 'n')                      // reemplaza ñ por n
    .replace(/[^a-zA-Z0-9\s-]/g, '')         // elimina caracteres especiales
    .replace(/\s+/g, '-')                    // reemplaza espacios por guiones
    .replace(/-+/g, '-')                     // colapsa múltiples guiones
    .replace(/^-+|-+$/g, '')                 // elimina guiones extremos
    .toLowerCase()
    .substring(0, 100);                      // máximo 100 caracteres
}

export default generarSlug;
