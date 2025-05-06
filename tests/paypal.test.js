// 📁 backend/tests/paypal.test.js
import request from 'supertest'
import app from '../server.js'

describe('🧪 Pruebas de integración: PayPal API', () => {

  test('❌ No debe permitir crear una orden sin total', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .send({}) // Sin total

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('ok', false)
    expect(res.body.message).toMatch(/total/i)
  })

  test('✅ Crear orden válida debe retornar ID y estado CREATED', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .send({ total: 10.50 })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
    expect(res.body.data).toBeDefined()
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('status', 'CREATED')
  })

})
