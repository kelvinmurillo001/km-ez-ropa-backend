// 📁 backend/metrics/prometheus.js
import { Registry, collectDefaultMetrics, Counter } from 'prom-client'

const promRegistry = new Registry()
collectDefaultMetrics({ register: promRegistry })

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Número total de requests HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [promRegistry]
})

const contarRequestPrometheus = (req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.originalUrl || 'unknown',
      status: res.statusCode
    })
  })
  next()
}

export { promRegistry, contarRequestPrometheus }
