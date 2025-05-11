import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 📌 Ruta del archivo actual y carpeta de logs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

// 📁 Crear carpeta de logs si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🎨 Colores para consola
winston.addColors({
  info: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'cyan'
});

// 🛠️ Formato general para los logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) =>
    `[${timestamp}] [${level.toUpperCase()}] ${message}`
  )
);

// 📋 Definición de transportes
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }),
  new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
  new winston.transports.File({ filename: path.join(logDir, 'warn.log'), level: 'warn' }),
  new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
];

// 🚀 Crear logger principal
const logger = winston.createLogger({
  level: 'info',
  levels: winston.config.npm.levels,
  transports
});

// 🧪 Mensaje inicial en modo desarrollo
if (process.env.NODE_ENV === 'development') {
  logger.debug('🧪 Logger inicializado en modo desarrollo');
}

export default logger;
