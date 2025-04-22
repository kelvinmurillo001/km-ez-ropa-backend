// 📁 backend/controllers/authController.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * 🎟️ Genera un JWT válido por 7 días
 * @param {Object} user - Objeto de usuario autenticado
 * @returns {string} JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * 🔐 Login exclusivo para administradores
 * @route POST /api/auth/login
 * @access Público (autenticación inicial)
 */
const loginAdmin = async (req, res) => {
  try {
    const username = req.body.username?.trim()
    const password = req.body.password

    // ⚠️ Validación de campos básicos
    if (!username || username.length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Nombre de usuario inválido o incompleto'
      })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Contraseña inválida o muy corta'
      })
    }

    // 🔍 Buscar usuario (con contraseña incluida)
    const user = await User.findOne({ username }).select('+password')

    // ❌ Usuario no existe o no es administrador
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        ok: false,
        message: '❌ Credenciales inválidas o no autorizado'
      })
    }

    // ✅ Verificar contraseña
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: '❌ Credenciales inválidas o no autorizado'
      })
    }

    // 🎫 Generar JWT
    const token = generateToken(user)

    // ✅ Respuesta exitosa
    return res.status(200).json({
      ok: true,
      message: '✅ Login exitoso',
      token,
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
