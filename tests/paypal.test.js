import request from 'supertest'
import app from '../server.js'

describe('🧪 Pruebas de integración: PayPal API', () => {

  test('❌ No debe permitir crear una orden sin total', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .send({}) // total faltante

    expect(res.statusCode).toBe(400)
    expect(res.body).toMatchObject({
      ok: false,
      message: expect.stringMatching(/total/i)
    })
  })

  test('✅ Crear orden válida debe retornar ID y estado CREATED', async () => {
    const res = await request(app)
      .post('/api/paypal/create-order')
      .send({ total: 10.50 })

    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: 'CREATED'
      })
    )
  })

})
