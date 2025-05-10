// 📁 backend/utils/logger.js
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// 📌 Directorio local (__dirname en ESModules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Carpeta donde guardar logs
const logDir = path.resolve(__dirname, '../../logs');

// 🎨 Colores de consola
const colors = {
  info: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'cyan'
};

winston.addColors(colors);

// 🛠️ Formato general
const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) =>
    `[${timestamp}] [${level.toUpperCase()}] ${message}`
  )
);

// 📋 Transports (destinos)
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      format
    )
  }),
  new winston.transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
  new winston.transports.File({ filename: `${logDir}/warn.log`, level: 'warn' }),
  new winston.transports.File({ filename: `${logDir}/combined.log` })
];

// 🔐 Crear logger
const logger = winston.createLogger({
  level: 'info',
  levels: winston.config.npm.levels,
  transports
});

// 🧪 Atajo para desarrollo
if (process.env.NODE_ENV === 'development') {
  logger.debug('🧪 Logger inicializado en modo desarrollo');
}

export default logger;
