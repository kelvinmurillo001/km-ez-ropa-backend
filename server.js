// 🌐 Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// ⚙️ Config env
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 CORS Config
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

// 📦 Middlewares
app.use(express.json({ limit: '2mb' }));
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(morgan('dev'));

// 🖼️ Archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));

// 🔗 Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const promoRoutes = require('./routes/promoRoutes');
const orderRoutes = require('./routes/orderRoutes');
const visitRoutes = require('./routes/visitRoutes');
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// (opcional) Log de subida
app.use('/api/uploads', (req, res, next) => {
  console.log('📂 Subida recibida');
  next();
}, uploadRoutes);

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/visitas', visitRoutes);
app.use('/api/stats', statsRoutes);

// 🛡️ Health check
app.get('/', (req, res) => {
  res.send('✅ API is working correctly');
});

// ⚠️ 404 Middleware
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

// 🧼 Error handler global
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 🚀 Conexión Mongo y servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB error:', err.message);
});
