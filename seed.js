// 📌 Script para crear un usuario admin

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const crearAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // Verificar si ya existe el usuario admin
    const existe = await User.findOne({ username: 'admin' })
    if (existe) {
      console.warn('⚠️ Ya existe un usuario con username: admin')
      return process.exit()
    }

    // Crear el usuario administrador
    const admin = await User.create({
      username: 'admin',
      name: 'Administrador',
      email: 'admin@kmezropa.com',
      password: 'admin2025', // 🔐 Será hasheado automáticamente
      role: 'admin'
    })

    console.log('✅ Usuario administrador creado exitosamente:')
    console.log({
      username: admin.username,
      email: admin.email,
      role: admin.role
    })

    process.exit()
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error.message)
    process.exit(1)
  }
}

crearAdmin()
