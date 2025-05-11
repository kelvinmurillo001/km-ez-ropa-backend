// 📁 backend/ws/socketServer.js
import { Server } from 'socket.io'

let io

export default function crearSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // cambia esto según tu frontend
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Nuevo cliente conectado: ${socket.id}`)

    socket.on('mensaje', (msg) => {
      console.log(`📩 Mensaje recibido: ${msg}`)
    })

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`)
    })
  })

  global.io = io
}
