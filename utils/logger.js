// 📁 backend/utils/logger.js
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 📌 Determinar ruta absoluta del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

// 📁 Crear carpeta de logs si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🎨 Definir colores personalizados
winston.addColors({
  info: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'blue'
});

// 📦 Formato de log personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n${stack}`
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  })
);

// 📤 Transportes de logs
const transports = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error'
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'warn.log'),
    level: 'warn'
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log')
  })
];

// 🖥️ Agregar consola solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  transports.unshift(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  );
}

// 🚀 Crear logger principal
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: winston.config.npm.levels,
  format: customFormat,
  transports
});

// 🧪 Log de inicio
if (process.env.NODE_ENV !== 'production') {
  logger.debug('🧪 Logger activo en modo desarrollo');
}

export default logger;
