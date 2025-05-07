// 📁 backend/server.js

// 🌐 Dependencias principales
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import path from 'path'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import mongoSanitize from 'express-mongo-sanitize'
import xssClean from 'xss-clean'
import hpp from 'hpp'
import session from 'express-session'
import passport from 'passport'
import MongoStore from 'connect-mongo'
import { fileURLToPath } from 'url'

// 📍 __dirname fix for ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ⚙️ Configuración
import config from './config/configuracionesito.js'
import errorHandler from './middleware/errorHandler.js'

// 🔐 Configurar passport
import './config/passport.js'

// 🔗 Rutas API
import authRoutes from './routes/authRoutes.js'
import googleAuthRoutes from './routes/auth.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import promoRoutes from './routes/promoRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import visitRoutes from './routes/visitRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import paypalRoutes from './routes/paypalRoutes.js'

// ✅ Crear app
const app = express()

/* -------------------------------------------------------------------------- */
/* 🔒 Protección contra abuso                                                 */
/* -------------------------------------------------------------------------- */
app.use(rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: '⚠️ Demasiadas solicitudes. Intenta más tarde.'
}))

app.use(slowDown({
  windowMs: config.rateLimitWindow * 60 * 1000,
  delayAfter: 20,
  delayMs: () => 500
}))

/* -------------------------------------------------------------------------- */
/* 🛡️ Seguridad y sanitización                                                */
/* -------------------------------------------------------------------------- */
if (config.enableMongoSanitize) app.use(mongoSanitize())
if (config.enableXSSProtection) app.use(xssClean())
if (config.enableHPP) app.use(hpp())

/* -------------------------------------------------------------------------- */
/* 🌐 CORS dinámico                                                            */
/* -------------------------------------------------------------------------- */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true)
    } else {
      console.error(`❌ CORS no permitido: ${origin}`)
      callback(new Error('❌ CORS no permitido'))
    }
  },
  credentials: true
}))

/* -------------------------------------------------------------------------- */
/* 📦 Middlewares comunes                                                     */
/* -------------------------------------------------------------------------- */
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan(config.env === 'production' ? 'tiny' : 'dev'))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true })) // 🆕 para compatibilidad con formularios

/* -------------------------------------------------------------------------- */
/* 🔐 Sesiones y Passport                                                     */
/* -------------------------------------------------------------------------- */
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
    sameSite: 'lax'
  }
}))

app.use(passport.initialize())
app.use(passport.session())

/* -------------------------------------------------------------------------- */
/* 💨 Compresión HTTP                                                         */
/* -------------------------------------------------------------------------- */
app.use(compression({
  level: 6,
  filter: (req, res) =>
    req.headers['x-no-compression'] ? false : compression.filter(req, res)
}))

/* -------------------------------------------------------------------------- */
/* 📂 Archivos estáticos                                                      */
/* -------------------------------------------------------------------------- */
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')))

/* -------------------------------------------------------------------------- */
/* 📚 Montaje de rutas                                                        */
/* -------------------------------------------------------------------------- */
app.use('/api/auth', authRoutes)
app.use('/auth', googleAuthRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/promos', promoRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/visitas', visitRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/paypal', paypalRoutes)

/* -------------------------------------------------------------------------- */
/* ✅ Raíz y /health                                                          */
/* -------------------------------------------------------------------------- */
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-ROPA funcionando correctamente 🚀')
})

app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? '🟢 OK' : '🔴 ERROR'
  if (dbStatus !== '🟢 OK') console.warn('⚠️ MongoDB no está disponible.')
  res.status(200).json({
    status: '✅ Backend activo',
    db: dbStatus,
    timestamp: new Date().toISOString()
  })
})

/* -------------------------------------------------------------------------- */
/* ❌ 404 - Ruta no encontrada                                                */
/* -------------------------------------------------------------------------- */
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' })
})

/* -------------------------------------------------------------------------- */
/* 🧯 Manejador de errores global                                             */
/* -------------------------------------------------------------------------- */
app.use(errorHandler)

/* -------------------------------------------------------------------------- */
/* 🚀 Iniciar servidor y conectar a MongoDB                                   */
/* -------------------------------------------------------------------------- */
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      if (!config.mongoUri) throw new Error('❌ FALTA config.mongoUri')
      await mongoose.connect(config.mongoUri)
      console.log('✅ Conectado exitosamente a MongoDB Atlas')

      app.listen(config.port, () => {
        console.log(`🚀 Servidor escuchando en: http://localhost:${config.port}`)
        console.log(`🌍 Modo: ${config.env}`)
      })
    } catch (err) {
      console.error('❌ Error conectando con MongoDB:', err.message)
      process.exit(1)
    }
  }

  startServer()
}

export default app
