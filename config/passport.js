// 📁 backend/config/passport.js
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar si ya existe un usuario con ese Google ID
        const existingUser = await User.findOne({ googleId: profile.id })

        if (existingUser) {
          return done(null, existingUser)
        }

        // Verificar si ya existe un usuario con ese email (sin Google ID)
        const email = profile.emails[0].value.toLowerCase()
        const userByEmail = await User.findOne({ email })

        if (userByEmail) {
          // Evitar duplicados: conectar el Google ID al usuario existente
          userByEmail.googleId = profile.id
          await userByEmail.save()
          return done(null, userByEmail)
        }

        // Asignar rol según correo
        const isAdmin = email === 'admin@tudominio.com'
        const role = isAdmin ? 'admin' : 'client'

        // Crear nuevo usuario
        const newUser = await User.create({
          googleId: profile.id,
          email: email,
          name: profile.displayName,
          role: role
        })

        return done(null, newUser)
      } catch (err) {
        console.error('❌ Error en estrategia de Google:', err)
        return done(err, null)
      }
    }
  )
)

// Serialización del usuario en sesión
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialización del usuario desde sesión
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null))
})
