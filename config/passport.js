// 📁 backend/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import config from './configuracionesito.js';
import logger from '../utils/logger.js';

// ✅ Callback URL definida desde configuración
const callbackURL = config.google.callbackURL || '/auth/google/callback';

// 🚀 Estrategia de autenticación con Google
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('📥 Google profile:', JSON.stringify(profile, null, 2));

        const emailObj = Array.isArray(profile.emails) ? profile.emails.find(e => !!e?.value) : null;
        const email = emailObj?.value?.toLowerCase();

        if (!email || typeof email !== 'string') {
          logger.error('❌ No se pudo obtener un email válido desde Google:', profile.emails);
          return done(new Error('❌ Email inválido desde Google'), null);
        }

        // 🔍 Buscar por Google ID
        let user = await User.findOne({ googleId: profile.id });

        // 📌 Si no existe, buscar por email
        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
            logger.info(`🔗 Vinculado Google ID con usuario existente: ${email}`);
          }
        }

        // ✅ Usuario existente
        if (user) {
          logger.info(`✅ Usuario autenticado con Google: ${user.email}`);
          return done(null, user);
        }

        // 🆕 Crear nuevo usuario con username único
        const displayName = (profile.displayName || email.split('@')[0] || '').trim();
        if (displayName.length < 2) {
          return done(new Error('❌ Nombre muy corto para crear cuenta'), null);
        }

        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

        const newUser = await User.create({
          googleId: profile.id,
          email,
          name: displayName,
          username: uniqueUsername,
          role: 'client',
        });

        logger.info(`✨ Usuario creado con Google: ${newUser.email}`);
        return done(null, newUser);
      } catch (error) {
        logger.error('❌ Error en estrategia de Google:', error);
        return done(error, null);
      }
    }
  )
);

// 🧠 Guardar usuario en sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 🔄 Recuperar usuario desde sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
