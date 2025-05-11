// 📁 backend/services/authService.js
const API_BASE = 'https://api.kmezropacatalogo.com';

/**
 * 👤 Obtener el usuario actualmente autenticado
 * @returns {Promise<Object|null>} Objeto de usuario o null si no hay sesión
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorInfo = await response.text();
      console.warn(`⚠️ Usuario no autenticado (${response.status}):`, errorInfo);
      return null;
    }

    const data = await response.json();
    if (!data || !data.ok || !data.user) {
      console.warn('⚠️ Respuesta inesperada al obtener usuario:', data);
      return null;
    }

    return data.user;
  } catch (err) {
    console.error('❌ Error al obtener usuario actual:', err.message || err);
    return null;
  }
};
