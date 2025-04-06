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

// 📦 Middleware
app.use(cors({
  origin: 'https://km-ez-ropa-frontend.onrender.com',
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// 🖼️ CORS para imágenes subidas
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));

// 🔗 Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const promoRoutes = require('./routes/promoRoutes');
const orderRoutes = require('./routes/orderRoutes');
const visitRoutes = require('./routes/visitRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/visitas', visitRoutes);
app.use('/api/stats', statsRoutes); // ✅ corregido


// 🛡️ Health check
app.get('/', (req, res) => {
  res.send('✅ API is working correctly');
});

// 🚀 DB & Start
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

// 🧼 Global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);
