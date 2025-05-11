// 📁 backend/ws/socketServer.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export default function crearSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://kmezropacatalogo.com', 'https://km-ez-ropa-frontend.onrender.com']
          : '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn('🔒 Conexión sin token rechazada');
      return next(new Error('Token requerido para conectar.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.warn('❌ Token JWT inválido en WebSocket:', err.message);
      return next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id} (Usuario ID: ${socket.userId})`);

    socket.on('mensaje', (msg) => {
      console.log(`📩 Mensaje recibido de ${socket.userId}:`, msg);
    });

    socket.on('notificacion', (data) => {
      console.log(`🔔 Notificación recibida:`, data);
      // Reenviar a todos (puedes personalizarlo por usuario, room, etc)
      io.emit('notificacion', data);
    });

    socket.on('nuevo-pedido', (pedido) => {
      console.log(`🛒 Pedido nuevo recibido:`, pedido);
      // Reenviar al admin u otros conectados
      io.emit('admin:pedidoNuevo', pedido);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  global.io = io;
}
