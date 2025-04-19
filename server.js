// 🌐 Dependencias principales
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// ⚙️ Configuración inicial del entorno
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 🛑 Validación crítica: conexión a MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: Falta MONGO_URI en el archivo .env");
  process.exit(1);
}

// 🔐 CORS configurado para permitir origenes válidos
const allowedOrigins = [
  'https://km-ez-ropa-frontend.onrender.com',
  'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
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
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado exitosamente a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor activo en: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
