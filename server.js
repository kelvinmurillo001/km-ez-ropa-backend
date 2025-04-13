// 🌐 Dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// ⚙️ Configuración inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 🛑 Validación de entorno
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no definido en .env");
  process.exit(1);
}

// 🔐 CORS
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

// 🧱 Middlewares
app.use(express.json({ limit: '2mb' }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

// 🖼️ Archivos estáticos
const assetsPath = path.join(__dirname, 'frontend', 'assets');
app.use('/assets', express.static(assetsPath));

// 🔗 Rutas
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/visitas', require('./routes/visitRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// 🧠 Ruta principal
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀');
});

// ❌ Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🛡️ Manejador global de errores
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 🚀 Conexión a la base de datos y arranque
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
})
.catch(err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  process.exit(1);
});
