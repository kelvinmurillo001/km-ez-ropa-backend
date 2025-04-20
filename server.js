// 🌐 Dependencias principales 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// ⚙️ Configuración central
const config = require('./config/configuracionesito');
const errorHandler = require('./middleware/errorHandler');

// 🧠 Inicializar app
const app = express();

// 🔐 CORS configurado dinámicamente
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ CORS no permitido'));
    }
  },
  credentials: true
}));

// 🔒 Seguridad y middlewares comunes
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

// 🖼️ Servir recursos estáticos
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));

// 🔗 Rutas organizadas por módulo
try {
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/promos', require('./routes/promoRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/visitas', require('./routes/visitRoutes'));
  app.use('/api/stats', require('./routes/statsRoutes'));
  app.use('/api/uploads', require('./routes/uploadRoutes'));
} catch (err) {
  console.error('❌ Error cargando rutas:', err.message);
}

// ✅ Ruta básica para probar el backend
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀');
});

// ❌ Rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🛡️ Middleware de errores
app.use(errorHandler);

// 🚀 Conexión a la base de datos y arranque del servidor
(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Conectado exitosamente a MongoDB');
    app.listen(config.port, () => {
      console.log(`🚀 Servidor activo en: http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
})();
