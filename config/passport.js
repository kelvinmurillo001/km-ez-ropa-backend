// 📁 backend/config/passport.js
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import config from './configuracionesito.js'

// Valida la URL de callback; puede definirse en config.google.callbackURL
const callbackURL = config.google.callbackURL || '/auth/google/callback'

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Obtener y validar email
        const email = profile.emails?.[0]?.value?.toLowerCase()
        if (!email) {
          return done(new Error('No se pudo obtener el email de Google'), null)
        }

        // Buscar usuario existente por Google ID o email
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = await User.findOne({ email })
          if (user) {
            // Vincula Google ID al usuario existente
            user.googleId = profile.id
            await user.save()
          }
        }

        // Si existe, retorna el usuario
        if (user) {
          return done(null, user)
        }

        // Si no existe, crear nuevo usuario con rol 'client'
        const newUser = await User.create({
          googleId: profile.id,
          email,
          name: profile.displayName,
          role: 'client'
        })
        return done(null, newUser)
      } catch (err) {
        console.error('❌ Error en estrategia de Google:', err)
        return done(err, null)
      }
    }
  )
)

// Serialización y deserialización de sesión
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null))
})
