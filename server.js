// 📁 backend/server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { fileURLToPath } from 'url';

import validarBodyGlobal from './middleware/validateBody.js';
import { promRegistry } from './metrics/prometheus.js';
import { crearSocketServer } from './ws/socketServer.js'; // ✅ Corrección aquí

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import config from './config/configuracionesito.js';
import errorHandler from './middleware/errorHandler.js';
import './config/passport.js';

// 🔗 Rutas API
import authRoutes from './routes/authRoutes.js';
import googleAuthRoutes from './routes/auth.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';
import resetPasswordRoutes from './routes/reset.js';

const app = express();

/* ─────────────── SEGURIDAD GENERAL ─────────────── */
app.disable('x-powered-by');

app.use(rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: '⚠️ Demasiadas solicitudes. Intenta más tarde.'
}));

app.use(slowDown({
  windowMs: config.rateLimitWindow * 60 * 1000,
  delayAfter: 20,
  delayMs: () => 500
}));

if (config.enableMongoSanitize) app.use(mongoSanitize());
if (config.enableXSSProtection) app.use(xssClean());
if (config.enableHPP) app.use(hpp());

/* ─────────────── CORS SEGURO ─────────────── */
app.use(cors({
  origin: (origin, callback) => {
    const cleanOrigin = origin?.replace(/\/$/, '');
    if (!origin || config.allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS rechazado: ${origin}`);
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true
}));

/* ─────────────── HEADERS SEGUROS ─────────────── */
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "img-src 'self' data: https://*.googleusercontent.com https://lh3.googleusercontent.com https://www.google-analytics.com; " +
    "frame-src https://accounts.google.com https://*.google.com; " +
    "connect-src 'self' https://api.kmezropacatalogo.com https://www.google-analytics.com; " +
    "object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
  );
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
  next();
});

/* ─────────────── LOGS Y PARSERS ─────────────── */
app.use(morgan(config.env === 'production' ? 'tiny' : 'dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(validarBodyGlobal);
app.use(compression());

/* ─────────────── SESIONES SEGURAS ─────────────── */
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    collectionName: 'sessions',
    ttl: config.sessionTTL || 14 * 24 * 60 * 60
  }),
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: config.env === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* ─────────────── RUTAS API ─────────────── */
app.use('/api/auth', authRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/visitas', visitRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/auth', resetPasswordRoutes);

/* ─────────────── MÉTRICAS PROMETHEUS ─────────────── */
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promRegistry.contentType);
    res.end(await promRegistry.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

/* ─────────────── ESTADO Y SALUD ─────────────── */
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? '🟢 OK' : '🔴 ERROR';
  if (dbStatus !== '🟢 OK') console.warn('⚠️ MongoDB no está disponible.');
  res.status(200).json({
    status: '✅ Backend activo',
    db: dbStatus,
    timestamp: new Date().toISOString()
  });
});

/* ─────────────── 404 Y ERRORES ─────────────── */
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' });
});

app.use(errorHandler);

/* ─────────────── INICIAR SERVIDOR ─────────────── */
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      if (!config.mongoUri) throw new Error('❌ FALTA config.mongoUri');
      await mongoose.connect(config.mongoUri);
      console.log('✅ Conectado a MongoDB Atlas');

      const httpServer = app.listen(config.port, () => {
        console.log(`🚀 Servidor escuchando en: http://localhost:${config.port}`);
        console.log(`🌍 Modo: ${config.env}`);
      });

      crearSocketServer(httpServer); // ✅ Ahora funciona correctamente
    } catch (err) {
      console.error('❌ Error al conectar con MongoDB:', err.message);
      process.exit(1);
    }
  };

  startServer();
}

export default app;
