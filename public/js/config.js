// 📁 backend\public\js\config.js

// 🌐 Detección del hostname actual
const hostname = (window?.location?.hostname || "").toLowerCase();

/**
 * 🔍 Detecta si estamos en un entorno de desarrollo local
 */
export const IS_LOCALHOST =
  hostname.includes("localhost") ||
  hostname.includes("127.0.0.1") ||
  hostname.endsWith(".local");

/**
 * 🌍 Dominio actual del frontend
 */
export const FRONTEND_DOMAIN = window.location.origin;

/**
 * 🌐 Base URL segura para la API backend
 * ✅ Unificado en un solo dominio: ya no se usa un subdominio como api.*
 */
export const API_BASE = window.location.origin;

/**
 * 🔐 URL de inicio de sesión con Google (redirige al backend unificado)
 */
export const GOOGLE_LOGIN_URL = `${API_BASE}/auth/google`;

/**
 * 📦 Claves utilizadas en LocalStorage
 */
export const STORAGE_KEYS = {
  token: "admin_token",      // JWT del administrador
  user: "admin_user"         // Usuario autenticado
};

/**
 * ⏳ Tiempo máximo de sesión (tracking UI opcional)
 */
export const SESSION_TIMEOUT_MIN = 60;

/**
 * 🧪 Logging básico para debug en desarrollo
 */
if (IS_LOCALHOST) {
  console.debug("🧪 Config.js cargado en modo desarrollo");
  console.debug("➡️ API_BASE:", API_BASE);
}
