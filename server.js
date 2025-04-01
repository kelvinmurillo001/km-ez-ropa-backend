// 🌐 Dependencies 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// ⚙️ Load environment variables
dotenv.config();

// 🚀 Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// 📦 Middlewares
app.use(cors());
app.use(express.json());

// línea para acceder a assets del frontend (local, opcional si ya está el frontend separado)
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));

// ✅ línea esencial para producción (Render):
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// 🔗 Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const promoRoutes = require('./routes/promoRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ NUEVA RUTA DE PEDIDOS

// 🧭 Use routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/orders', orderRoutes); // ✅ USO DE RUTA DE PEDIDOS

// 🛡️ Root endpoint (health check)
app.get('/', (req, res) => {
  res.send('✅ API is working correctly');
});

// 🧠 Connect to MongoDB
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
.catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error.message);
});
