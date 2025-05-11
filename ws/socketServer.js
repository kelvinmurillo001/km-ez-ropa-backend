// 📁 backend/ws/socketServer.js
import { Server } from 'socket.io'

export default function crearSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`🟢 Socket conectado: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`🔴 Socket desconectado: ${socket.id}`)
    })

    // Puedes manejar eventos personalizados:
    socket.on('mensaje', (data) => {
      console.log('📩 mensaje recibido:', data)
    })
  })

  global.io = io // opcional para emitir desde otras partes del backend
}
