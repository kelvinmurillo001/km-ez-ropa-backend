// 📁 backend/metrics/prometheus.js
import { Registry, collectDefaultMetrics, Counter } from 'prom-client';

const promRegistry = new Registry();

// 📊 Recolectar métricas de Node.js por defecto (RAM, CPU, etc.)
collectDefaultMetrics({ register: promRegistry });

// 📈 Contador de solicitudes HTTP
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Número total de solicitudes HTTP recibidas',
  labelNames: ['method', 'route', 'status'],
  registers: [promRegistry]
});

/**
 * 🧮 Middleware Prometheus para contar cada request
 */
const contarRequestPrometheus = (req, res, next) => {
  res.on('finish', () => {
    const route = req.route?.path || req.originalUrl || 'unknown';
    httpRequestCounter.inc({
      method: req.method,
      route,
      status: res.statusCode
    });
  });
  next();
};

export {
  promRegistry,
  contarRequestPrometheus
};
