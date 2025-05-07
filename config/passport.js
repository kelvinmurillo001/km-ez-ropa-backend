// 📁 backend/config/passport.js
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import config from './configuracionesito.js'
import logger from '../utils/logger.js'

// ✅ Callback URL desde entorno o config
const callbackURL = config.google.callbackURL || '/auth/google/callback'

// 🚀 Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Validar email
        const email = profile?.emails?.[0]?.value?.toLowerCase()
        if (!email || typeof email !== 'string') {
          return done(new Error('❌ No se pudo obtener un email válido desde Google'), null)
        }

        // Buscar usuario por Google ID
        let user = await User.findOne({ googleId: profile.id })

        // Si no se encontró, buscar por email
        if (!user) {
          user = await User.findOne({ email })

          // Si existe, vincula Google ID
          if (user) {
            user.googleId = profile.id
            await user.save()
          }
        }

        // Retornar existente o crear nuevo
        if (user) return done(null, user)

        // Crear nuevo usuario si no existe
        const newUser = await User.create({
          googleId: profile.id,
          email,
          name: profile.displayName || email.split('@')[0],
          role: 'client'
        })

        return done(null, newUser)
      } catch (err) {
        logger.error('❌ Error en estrategia de Google:', err)
        return done(err, null)
      }
    }
  )
)

// 🧠 Serialización de usuario
passport.serializeUser((user, done) => done(null, user.id))

// 🔄 Deserialización
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null))
})
