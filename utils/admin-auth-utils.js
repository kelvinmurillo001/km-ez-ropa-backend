import config from '../config/configuracionesito.js';

/**
 * ✅ Verifica si el usuario tiene rol de administrador
 * @param {Object} usuario - Objeto de usuario desde el token o sesión
 * @returns {boolean}
 */
export function esAdmin(usuario) {
  return (
    usuario &&
    typeof usuario === 'object' &&
    (
      usuario.role?.toLowerCase?.() === 'admin' ||
      usuario.isAdmin === true
    )
  );
}

/**
 * ❌ Devuelve una respuesta de error con formato uniforme
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} mensaje - Mensaje de error a mostrar
 * @param {number} status - Código de estado HTTP (por defecto 500)
 * @param {any} detalles - (opcional) Detalles internos para debug
 */
export function enviarError(res, mensaje = '❌ Error del servidor', status = 500, detalles = null) {
  if (!res || typeof res.status !== 'function') {
    console.warn('⚠️ [enviarError] Objeto de respuesta inválido');
    return;
  }

  if (config.env !== 'production' && detalles) {
    console.error(`🪵 [ERROR DEBUG] ${mensaje}`, detalles);
  }

  return res.status(status).json({
    ok: false,
    message: mensaje,
    ...(config.env !== 'production' && detalles && { debug: detalles })
  });
}

/**
 * ✅ Devuelve una respuesta de éxito con formato uniforme
 * @param {Object} res - Objeto de respuesta de Express
 * @param {any} data - Datos a retornar al cliente
 * @param {string} mensaje - Mensaje opcional de éxito
 */
export function enviarExito(res, data = {}, mensaje = '✅ Operación exitosa') {
  if (!res || typeof res.status !== 'function') {
    console.warn('⚠️ [enviarExito] Objeto de respuesta inválido');
    return;
  }

  return res.status(200).json({
    ok: true,
    message: mensaje,
    data
  });
}

/**
 * 🕵️‍♂️ Extrae el token del encabezado Authorization
 * @param {Object} req - Objeto de petición de Express
 * @returns {string|null} Token válido o null si no existe o es inválido
 */
export function obtenerTokenDesdeHeader(req) {
  if (!req?.headers?.authorization) return null;

  const authHeader = String(req.headers.authorization || '').trim();
  const [bearer, token] = authHeader.split(' ');

  const isValidBearer = bearer?.toLowerCase() === 'bearer';
  const isTokenValid = token && token.length >= 20;

  if (!isValidBearer || !isTokenValid) {
    if (config.env !== 'production') {
      console.warn('⚠️ Token inválido o mal formado en Authorization header');
    }
    return null;
  }

  return token.trim();
}
