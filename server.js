// 🌐 Dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// ⚙️ Variables de entorno
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("❌ No se ha definido MONGO_URI en el archivo .env");
  process.exit(1);
}

// 🔐 Configuración CORS
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

// 🖼️ Archivos estáticos
const assetsPath = path.join(__dirname, 'frontend', 'assets');
app.use('/assets', express.static(assetsPath));

// 🔗 Rutas
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const promoRoutes = require('./routes/promoRoutes');
const orderRoutes = require('./routes/orderRoutes');
const visitRoutes = require('./routes/visitRoutes');
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// ✅ Rutas API
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/visitas', visitRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/uploads', (req, res, next) => {
  console.log('📂 Subida recibida');
  next();
});
app.use('/api/uploads', uploadRoutes); // SEPARADO PARA EVITAR ERROR DE OBJETO

// 🛡️ Verificación de salud
app.get('/', (req, res) => {
  res.send('✅ API is working correctly');
});

// ⚠️ Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🧼 Manejo de errores global
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
