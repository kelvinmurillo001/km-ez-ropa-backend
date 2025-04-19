// src/utils/admin-auth-utils.js
"use strict";

/**
 * ✅ Verifica si el usuario tiene rol de administrador
 * @param {Object} usuario - Objeto de usuario desde el token o sesión
 * @returns {boolean}
 */
export function esAdmin(usuario) {
  return usuario?.rol === "admin" || usuario?.isAdmin === true;
}

/**
 * ❌ Devuelve una respuesta de error con formato uniforme
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} mensaje - Mensaje de error
 * @param {number} status - Código de estado HTTP (por defecto 500)
 */
export function enviarError(res, mensaje = "Error del servidor", status = 500) {
  return res.status(status).json({
    ok: false,
    message: mensaje,
  });
}

/**
 * ✅ Devuelve una respuesta de éxito con formato uniforme
 * @param {Object} res - Objeto de respuesta de Express
 * @param {any} data - Datos a retornar al cliente
 * @param {string} mensaje - Mensaje opcional de éxito
 */
export function enviarExito(res, data = {}, mensaje = "Operación exitosa") {
  return res.status(200).json({
    ok: true,
    message: mensaje,
    data,
  });
}

/**
 * 🕵️‍♂️ Extrae el token del header Authorization
 * @param {Object} req - Objeto de petición de Express
 * @returns {string|null} - Token extraído o null si no hay
 */
export function obtenerTokenDesdeHeader(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.split(" ")[1];
}
