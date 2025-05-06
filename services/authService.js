const API_BASE = 'https://api.kmezropacatalogo.com'

/**
 * 👤 Obtener el usuario actualmente autenticado
 * @returns {Promise<Object|null>} Objeto de usuario o null si no hay sesión
 */
export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!res.ok) {
      console.warn('⚠️ Usuario no autenticado o sesión expirada')
      return null
    }

    const data = await res.json()
    return data?.user || null
  } catch (err) {
    console.error('❌ Error al obtener usuario actual:', err)
    return null
  }
}
