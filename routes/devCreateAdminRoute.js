import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const router = express.Router()

// ⚠️ Ruta temporal para crear admin - ¡BORRAR luego!
router.post('/crear-admin-temporal', async (req, res) => {
  const { claveSecreta } = req.body

  if (claveSecreta !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ ok: false, message: '🔒 No autorizado' })
  }

  const existente = await User.findOne({ username: 'admin' })
  if (existente) {
    return res.status(400).json({ ok: false, message: '⚠️ Ya existe el usuario admin' })
  }

  const nuevo = new User({
    username: 'admin',
    name: 'Super Admin',
    email: 'admin@kmezropa.com',
    password: await bcrypt.hash('admin2025', 12),
    role: 'admin'
  })

  await nuevo.save()
  res.json({ ok: true, message: '✅ Usuario admin creado' })
})

export default router
