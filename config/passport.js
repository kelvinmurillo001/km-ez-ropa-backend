// 📁 backend/config/passport.js
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import config from './configuracionesito.js'
import logger from '../utils/logger.js'

// ✅ Callback URL definida desde configuración
const callbackURL = config.google.callbackURL || '/auth/google/callback'

// 🚀 Configurar estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value?.toLowerCase()

        if (!email || typeof email !== 'string') {
          return done(new Error('❌ No se pudo obtener un email válido desde Google'), null)
        }

        // Buscar usuario por Google ID
        let user = await User.findOne({ googleId: profile.id })

        // Si no existe por Google ID, buscar por email
        if (!user) {
          user = await User.findOne({ email })

          if (user) {
            // Vincular Google ID al usuario existente
            user.googleId = profile.id
            await user.save()
          }
        }

        // Si ya existe, finalizar con éxito
        if (user) return done(null, user)

        // Crear nuevo usuario si no existe
        const newUser = await User.create({
          googleId: profile.id,
          email,
          name: profile.displayName || email.split('@')[0],
          role: 'client'
        })

        return done(null, newUser)
      } catch (error) {
        logger.error('❌ Error en estrategia de Google:', error)
        return done(error, null)
      }
    }
  )
)

// 🧠 Serializar usuario a sesión
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// 🔄 Deserializar desde sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec()
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})
