// 🌐 Dependencias principales 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// ⚙️ Configuración
const config = require('./config/configuracionesito');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 🔐 CORS dinámico
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

// 🧱 Seguridad, logging y parsing
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

// 🖼️ Archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));

// 🔗 Rutas API
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/visitas', require('./routes/visitRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// ✅ Ruta de test
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀');
});

// 🔄 Ruta para monitoreo/uptime
app.get('/health', (req, res) => res.send('✅ OK'));

// ❌ Rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🛡️ Manejo global de errores
app.use(errorHandler);

// 🚀 Conexión a MongoDB y levantar servidor
(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Conectado exitosamente a MongoDB');
    app.listen(config.port, () => {
      console.log(`🚀 Servidor activo en: http://localhost:${config.port}`);
      console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
})();
