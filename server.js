// 🌐 Dependencias principales 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// ⚙️ Configuración central
const config = require('./config/configuracionesito');

const app = express();

// 🔐 CORS configurado para permitir origenes válidos
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

// 🧱 Middlewares útiles para seguridad y logging
app.use(express.json({ limit: '5mb' }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

// 🖼️ Servir imágenes o recursos estáticos desde carpeta 'frontend/assets'
const assetsPath = path.join(__dirname, 'frontend', 'assets');
app.use('/assets', express.static(assetsPath));

// 🔗 Rutas API (divididas por módulos)
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/visitas', require('./routes/visitRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// ✅ Ruta de prueba para asegurar que todo esté OK
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀');
});

// ❌ Manejador de rutas inexistentes
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🛡️ Manejador global de errores personalizado
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 🚀 Conexión y arranque del servidor
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('✅ Conectado exitosamente a MongoDB');
    app.listen(config.port, () => {
      console.log(`🚀 Servidor activo en: http://localhost:${config.port}`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
