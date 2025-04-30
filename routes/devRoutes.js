// 📁 backend/routes/devRoutes.js

import express from 'express'
import User from '../models/User.js'

const router = express.Router()

/**
 * ⚠️ Ruta temporal para crear un administrador en producción.
 * Acceso: Público (elimina después de usar).
 * URL: POST /api/dev/crear-admin-temporal
 */
router.post('/crear-admin-temporal', async (req, res) => {
  try {
    const existe = await User.findOne({ username: 'admin' })
    if (existe) {
      return res.status(409).json({
        message: '⚠️ Ya existe un usuario con username: admin'
      })
    }

    const nuevoAdmin = await User.create({
      username: 'admin',
      name: 'Administrador Principal',
      email: 'admin@kmezropa.com',
      password: 'admin2025',
      role: 'admin'
    })

    console.log('✅ Admin creado en producción:', nuevoAdmin.username)

    return res.status(201).json({
      message: '✅ Usuario admin creado correctamente',
      user: {
        username: nuevoAdmin.username,
        role: nuevoAdmin.role,
        email: nuevoAdmin.email
      }
    })
  } catch (err) {
    console.error('❌ Error al crear admin desde producción:', err.message)
    return res.status(500).json({
      message: '❌ Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
})

export default router
