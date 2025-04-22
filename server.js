// 🌐 Dependencias principales
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import path from 'path'
import { fileURLToPath } from 'url'

// ⚙️ Configuración personalizada
import config from './config/configuracionesito.js'
import errorHandler from './middleware/errorHandler.js'

// 📍 Corrección para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 🔐 CORS dinámico desde lista blanca
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

// 🧱 Middlewares de seguridad y performance
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(morgan(config.env === 'production' ? 'tiny' : 'dev'))
app.use(express.json({ limit: '5mb' }))
app.use(compression())

// 🖼️ Archivos públicos
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')))

// 🔗 Rutas API
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import promoRoutes from './routes/promoRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import visitRoutes from './routes/visitRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/promos', promoRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/visitas', visitRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/uploads', uploadRoutes)

// ✅ Ruta de test
app.get('/', (req, res) => {
  res.send('🧠 Backend KM-EZ-Ropa funcionando correctamente 🚀')
})

// 🔄 Ruta para uptime monitoring
app.get('/health', (req, res) => res.send('✅ OK'))

// ❌ Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ message: '❌ Ruta no encontrada' })
})

// 🛡️ Middleware de manejo de errores global
app.use(errorHandler)

// 🚀 Conexión MongoDB y arranque del servidor
try {
  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
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
