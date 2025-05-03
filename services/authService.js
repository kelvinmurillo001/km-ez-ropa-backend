export const getCurrentUser = async () => {
    try {
      const res = await fetch('https://api.kmezropacatalogo.com/auth/me', {
        credentials: 'include'
      })
      if (!res.ok) return null
      return await res.json()
    } catch (err) {
      console.error('❌ Error al obtener usuario:', err)
      return null
    }
  }
  