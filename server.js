// 🌐 Dependencias principales
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// ⚙️ Configuración personalizada
const config = require('./config/configuracionesito');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 🔐 CORS dinámico con lista blanca desde .env
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      console.error(`❌ CORS no permitido: ${origin}`);
      callback(new Error('❌ CORS no permitido'));
    }
  },
  credentials: true
}));


// 🧱 Middlewares esenciales
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(express.json({ limit: '5mb' }));
app.use(compression());

// 🖼️ Archivos estáticos públicos
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));

// 🔗 Rutas API modulares
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/visitas', require('./routes/visitRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// ✅ Ruta de prueba básica
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀');
});

// 🔄 Ruta de monitoreo para uptime robots
app.get('/health', (req, res) => res.send('✅ OK'));

// ❌ Ruta 404 personalizada
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🛡️ Middleware centralizado de errores
app.use(errorHandler);

// 🚀 Conexión a MongoDB + Arranque de servidor
(async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Conectado exitosamente a MongoDB');

    app.listen(config.port, () => {
      console.log(`🚀 Servidor activo en http://localhost:${config.port}`);
      console.log(`🌍 Modo: ${config.env}`);
    });
  } catch (err) {
    console.error('❌ Error al conectar con MongoDB:', err.message);
    console.error('🔍 Asegúrate de que tu IP esté permitida en MongoDB Atlas y las credenciales sean correctas.');
    process.exit(1);
  }
})();
