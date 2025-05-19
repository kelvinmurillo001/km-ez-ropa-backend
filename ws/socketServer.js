// 📁 backend/ws/socketServer.js
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

let io
const usuariosConectados = new Map() // userId → { socket, role }

/**
 * 🎯 Crear y configurar el servidor WebSocket
 * @param {import('http').Server} server - Servidor HTTP o HTTPS
 */
export function crearSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://kmezropacatalogo.com', 'https://km-ez-ropa-frontend.onrender.com']
        : '*',
      methods: ['GET', 'POST']
    }
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      console.warn('🔒 WS rechazada sin token')
      return next(new Error('Token requerido'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id

      // 🔍 Extraer rol desde DB
      const user = await User.findById(decoded.id).select('role')
      if (!user) throw new Error('Usuario no encontrado')
      socket.userRole = user.role || 'client'

      next()
    } catch (err) {
      console.warn('❌ Token inválido en WebSocket:', err.message)
      return next(new Error('Token JWT inválido'))
    }
  })

  io.on('connection', (socket) => {
    const { userId, userRole } = socket

    // Evitar múltiples conexiones por usuario
    if (usuariosConectados.has(userId)) {
      usuariosConectados.get(userId)?.socket.disconnect()
    }

    usuariosConectados.set(userId, { socket, role: userRole })

    console.log(`✅ WS Conectado: ${socket.id} | User: ${userId} | Rol: ${userRole}`)

    // 🛎️ Receptor general
    socket.on('notificacion', (data) => {
      console.log(`🔔 Notificación de ${userId}:`, data)
      io.emit('notificacion', data)
    })

    // 🛒 Nuevo pedido (solo broadcast a admin)
    socket.on('nuevo-pedido', (pedido) => {
      console.log(`🛒 Pedido de ${userId}:`, pedido)
      emitirATodosPorRol('admin', 'admin:pedidoNuevo', pedido)
    })

    // 💬 Chat general
    socket.on('mensaje', (msg) => {
      console.log(`💬 ${userId}:`, msg)
    })

    // 🔌 Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ WS Desconectado: ${socket.id}`)
      usuariosConectados.delete(userId)
    })
  })

  global.io = io
}

/**
 * 🔔 Enviar notificación a un usuario específico (si está conectado)
 * @param {string} userId
 * @param {object} payload
 * @returns {boolean}
 */
export function emitirNotificacion(userId, payload) {
  const userData = usuariosConectados.get(userId)
  if (!userData) {
    console.warn(`📭 Usuario ${userId} no está conectado`)
    return false
  }

  userData.socket.emit('cliente:notificacion', payload)
  return true
}

/**
 * 🧑‍🤝‍🧑 Emitir mensaje a todos los usuarios con un rol específico
 * @param {'admin'|'client'} rol
 * @param {string} evento
 * @param {any} data
 */
export function emitirATodosPorRol(rol, evento, data) {
  for (const [userId, { socket, role }] of usuariosConectados.entries()) {
    if (role === rol) {
      socket.emit(evento, data)
    }
  }
}
