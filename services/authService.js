// 📁 backend/services/authService.js
const API_BASE = 'https://api.kmezropacatalogo.com';

/**
 * 👤 Obtener el usuario autenticado usando cookies (JWT o sesión)
 * @returns {Promise<Object|null>} Devuelve el usuario o null si no autenticado
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include', // 🧩 Importante para cookies HTTP-only
      headers: {
        'Accept': 'application/json'
        // Agregar Authorization si se usa Bearer: 'Authorization': `Bearer ${token}`
      }
    });

    const contentType = response.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');

    // 📛 Verificar respuesta
    if (!response.ok) {
      const detalle = isJson ? await response.json() : await response.text();
      console.warn(`⚠️ Usuario no autenticado (${response.status})`, detalle);
      return null;
    }

    const data = await response.json();

    // 🎯 Validación estricta de datos
    if (!data || typeof data !== 'object' || !data.ok || !data.user || !data.user.id) {
      console.warn('⚠️ Respuesta inesperada de /auth/me:', data);
      return null;
    }

    return data.user;
  } catch (err) {
    console.error('❌ Error al obtener usuario actual:', err?.message || err);
    return null;
  }
};
