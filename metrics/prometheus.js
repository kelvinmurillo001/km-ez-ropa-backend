// 📁 backend/metrics/prometheus.js
import client from 'prom-client'

const promRegistry = new client.Registry()

// Métricas globales
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Cantidad total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status']
})

promRegistry.registerMetric(httpRequestCounter)
promRegistry.setDefaultLabels({ app: 'km-ez-ropa' })
client.collectDefaultMetrics({ register: promRegistry })

// Middleware para contar solicitudes
export function contarRequestPrometheus(req, res, next) {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.originalUrl || 'unknown',
      status: res.statusCode
    })
  })
  next()
}

export { promRegistry }
