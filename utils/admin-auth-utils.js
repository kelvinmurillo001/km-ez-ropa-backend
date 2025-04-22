/**
 * ✅ Verifica si el usuario tiene rol de administrador
 * @param {Object} usuario - Objeto de usuario desde el token o sesión
 * @returns {boolean}
 */
export function esAdmin(usuario) {
  return usuario?.role?.toLowerCase?.() === 'admin' || usuario?.isAdmin === true
}

/**
 * ❌ Devuelve una respuesta de error con formato uniforme
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} mensaje - Mensaje de error
 * @param {number} status - Código de estado HTTP (por defecto 500)
 */
export function enviarError(res, mensaje = '❌ Error del servidor', status = 500) {
  if (!res || typeof res.status !== 'function') {
    console.warn('⚠️ Se intentó enviar error pero el objeto res no es válido')
    return
  }

  return res.status(status).json({
    ok: false,
    message: mensaje
  })
}

/**
 * ✅ Devuelve una respuesta de éxito con formato uniforme
 * @param {Object} res - Objeto de respuesta de Express
 * @param {any} data - Datos a retornar al cliente
 * @param {string} mensaje - Mensaje opcional de éxito
 */
export function enviarExito(res, data = {}, mensaje = '✅ Operación exitosa') {
  if (!res || typeof res.status !== 'function') {
    console.warn('⚠️ Se intentó enviar éxito pero el objeto res no es válido')
    return
  }

  return res.status(200).json({
    ok: true,
    message: mensaje,
    data
  })
}

/**
 * 🕵️‍♂️ Extrae el token del encabezado Authorization
 * @param {Object} req - Objeto de petición de Express
 * @returns {string|null} - Token extraído o null si no existe
 */
export function obtenerTokenDesdeHeader(req) {
  const authHeader = req?.headers?.authorization
  if (!authHeader || typeof authHeader !== 'string') return null

  const [bearer, token] = authHeader.split(' ')
  if (bearer?.toLowerCase() !== 'bearer' || !token || token.length < 10) return null

  return token.trim()
}
