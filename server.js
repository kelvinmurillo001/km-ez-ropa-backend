// 🌐 Dependencias principales    
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
import { fileURLToPath } from 'url'

// 🔗 Rutas API
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import promoRoutes from './routes/promoRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import visitRoutes from './routes/visitRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import paypalRoutes from './routes/paypalRoutes.js';

// ⚙️ Configuración personalizada
import config from './config/configuracionesito.js'
import errorHandler from './middleware/errorHandler.js'

// 📍 Corrección para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

/* ──────────────────────────────── */
/* 🛡️ ANTI DDOS: Limites & Slowdown */
/* ──────────────────────────────── */
const limiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000,
  max: config.rateLimitMax,
  message: '⚠️ Demasiadas solicitudes desde esta IP. Intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false
})

const slow = slowDown({
  windowMs: config.rateLimitWindow * 60 * 1000,
  delayAfter: 20,
  delayMs: () => 500
})

app.use(limiter)
app.use(slow)

/* ───────────────────────────── */
/* 🧼 Seguridad avanzada 🥷 Ninja */
/* ───────────────────────────── */
if (config.enableMongoSanitize) app.use(mongoSanitize())
if (config.enableXSSProtection) app.use(xssClean())
if (config.enableHPP) app.use(hpp())

/* ─────────────────────── */
/* 🔐 CORS desde whitelist */
/* ─────────────────────── */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true)
      } else {
        console.error(`❌ CORS no permitido: ${origin}`)
        callback(new Error('❌ CORS no permitido'))
      }
    },
    credentials: true
  })
)

/* ─────────────────────── */
/* 🛡️ Seguridad general     */
/* ─────────────────────── */
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan(config.env === 'production' ? 'tiny' : 'dev'))
app.use(express.json({ limit: '5mb' }))

/* ────────────────────────────── */
/* 💨 Compresión avanzada HTTP    */
/* ────────────────────────────── */
app.use(
  compression({
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  })
)

/* ─────────────────────── */
/* 📂 Archivos Estáticos   */
/* ─────────────────────── */
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')))

/* ─────────────────────── */
/* 🔗 Rutas API            */
/* ─────────────────────── */
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/promos', promoRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/visitas', visitRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/paypal', paypalRoutes);

/* ─────────────────────── */
/* 📊 Test & Healthchecks  */
/* ─────────────────────── */
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀')
})

app.get('/health', (req, res) => res.send('✅ OK'))

/* ─────────────────────── */
/* ❌ 404 Not Found        */
/* ─────────────────────── */
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' })
})

/* ─────────────────────── */
/* 🧯 Manejo de errores    */
/* ─────────────────────── */
app.use(errorHandler)

/* ─────────────────────── */
/* 🚀 Conexión MongoDB     */
/* ─────────────────────── */
try {
  await mongoose.connect(config.mongoUri)
  console.log('✅ Conectado exitosamente a MongoDB')

  app.listen(config.port, () => {
    console.log(`🚀 Servidor activo en http://localhost:${config.port}`)
    console.log(`🌍 Modo: ${config.env}`)
  })
} catch (err) {
  console.error('❌ Error al conectar con MongoDB:', err.message)
  console.error('🔍 Verifica IP autorizada en MongoDB Atlas y credenciales .env.')
  process.exit(1)
}
