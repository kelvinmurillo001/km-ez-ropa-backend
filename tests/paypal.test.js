// 📁 backend/tests/paypal.test.js
import request from 'supertest'
import app from '../server.js'

describe('🧪 Pruebas de rutas PayPal API', () => {
  test('❌ Crear orden sin total debe fallar', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .send({}) // sin total

    expect(res.statusCode).toBe(400)
    expect(res.body.ok).toBe(false)
    expect(res.body.message).toMatch(/total/i)
  })

  test('✅ Crear orden válida debe funcionar', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .send({ total: 10.5 })

    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data.status).toBe('CREATED')
  })
})
