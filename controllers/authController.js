// 📁 backend/controllers/authController.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * 🔐 Access token - válido por 15 minutos
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
}

/**
 * 🔁 Refresh token - válido por 7 días
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * 🔐 Login exclusivo para administradores
 * @route POST /api/auth/login
 * @access Público
 */
const loginAdmin = async (req, res) => {
  try {
    const username = req.body.username?.trim()
    const password = req.body.password

    // ⚠️ Validaciones básicas
    if (!username || username.length < 3) {
      console.warn(`🛑 Login fallido - nombre de usuario inválido: ${username}`)
      return res.status(400).json({
        ok: false,
        message: '⚠️ Nombre de usuario inválido o incompleto'
      })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      console.warn(`🛑 Login fallido - contraseña inválida para usuario: ${username}`)
      return res.status(400).json({
        ok: false,
        message: '⚠️ Contraseña inválida o muy corta'
      })
    }

    // 🔍 Buscar usuario con password y refreshToken
    const user = await User.findOne({ username }).select('+password +refreshToken')

    if (!user || user.role !== 'admin') {
      console.warn(`🛑 Login fallido - usuario no encontrado o no admin: ${username}`)
      return res.status(401).json({
        ok: false,
        message: '❌ Credenciales inválidas o no autorizado'
      })
    }

    // ✅ Comparar contraseña
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      console.warn(`🛑 Login fallido - contraseña incorrecta para: ${username}`)
      return res.status(401).json({
        ok: false,
        message: '❌ Credenciales inválidas o no autorizado'
      })
    }

    // 🎟️ Generar tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // 💾 Guardar refresh token
    user.refreshToken = refreshToken
    await user.save()

    console.log(`✅ Login exitoso del administrador: ${username}`)

    // ✅ Respuesta con doble token
    return res.status(200).json({
      ok: true,
      message: '✅ Login exitoso',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('❌ Error en loginAdmin:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export { loginAdmin }
