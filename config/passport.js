// 📁 backend/config/passport.js

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import config from './configuracionesito.js';
import logger from '../utils/logger.js';

const callbackURL = config.google.callbackURL || '/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.debug('📥 Perfil Google recibido:', {
          id: profile.id,
          displayName: profile.displayName,
        });

        const emailObj = Array.isArray(profile.emails)
          ? profile.emails.find(e => !!e?.value)
          : null;
        const email = emailObj?.value?.toLowerCase() || null;

        if (!email) {
          logger.error('❌ Email inválido desde perfil Google.');
          return done(new Error('No se pudo obtener un email válido'), null);
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
            logger.info(`🔗 Google ID vinculado con cuenta existente: ${email}`);
          }
        }

        if (user) {
          logger.info(`✅ Usuario autenticado con Google: ${user.email}`);
          return done(null, user);
        }

        // Crear usuario nuevo
        const baseName = (profile.displayName || email.split('@')[0] || '').trim();
        if (baseName.length < 2) {
          return done(new Error('Nombre de usuario muy corto'), null);
        }

        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

        const newUser = await User.create({
          googleId: profile.id,
          email,
          name: baseName,
          username: uniqueUsername,
          role: 'client',
        });

        logger.info(`✨ Usuario nuevo creado con Google: ${newUser.email}`);
        return done(null, newUser);
      } catch (error) {
        logger.error('❌ Error en estrategia de Google OAuth:', error.message);
        return done(error, null);
      }
    }
  )
);

// Serialización
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialización
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    if (!user) throw new Error('Usuario no encontrado');
    done(null, user);
  } catch (error) {
    logger.error('❌ Error al deserializar usuario:', error.message);
    done(error, null);
  }
});
