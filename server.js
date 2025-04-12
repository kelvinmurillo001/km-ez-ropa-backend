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
  console.error("❌ No se ha definido MONGO_URI en el archivo .env");
  process.exit(1);
}

// 🔐 Configuración de CORS
const allowedOrigins = [
  'https://km-ez-ropa-frontend.onrender.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 🧱 Middlewares globales
app.use(express.json({ limit: '2mb' }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

// 🖼️ Servir archivos estáticos desde /assets
const assetsPath = path.join(__dirname, 'frontend', 'assets');
app.use('/assets', express.static(assetsPath));

// 🔗 Rutas de la API
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/visitas', require('./routes/visitRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes')); // 👈 Ya incluye controladores internos

// ✅ Ruta principal
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀');
});

// ⚠️ Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🛡️ Manejo de errores global
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 🚀 Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  process.exit(1);
});
