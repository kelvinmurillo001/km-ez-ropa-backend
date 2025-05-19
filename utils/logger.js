// 📁 backend/utils/logger.js
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 📌 Ruta del archivo y directorio de logs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

// 📁 Crear directorio si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🎨 Colores personalizados para consola
winston.addColors({
  info: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'cyan'
});

// 🧱 Formato base para todos los logs
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) =>
    `[${timestamp}] [${level.toUpperCase()}] ${message}`
  )
);

// 📋 Definición de transportes
const transports = [
  new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
  new winston.transports.File({ filename: path.join(logDir, 'warn.log'), level: 'warn' }),
  new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
];

// 🖥️ Consola solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  transports.unshift(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        baseFormat
      )
    })
  );
}

// 🚀 Instancia principal del logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: winston.config.npm.levels,
  transports
});

// 🧪 Log de confirmación
if (process.env.NODE_ENV !== 'production') {
  logger.debug('🧪 Logger iniciado en modo desarrollo');
}

export default logger;
