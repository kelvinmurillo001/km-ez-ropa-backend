// 📁 backend/tests/integration/paypal.test.js
import request from 'supertest';
import app from '../../server.js'; // ✅ Ajusta la ruta si tu entrypoint no es `server.js`

describe('🧪 Pruebas de integración: PayPal API', () => {
  describe('POST /api/paypal/create-order', () => {
    test('❌ No debe permitir crear una orden sin total', async () => {
      const res = await request(app)
        .post('/api/paypal/create-order')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'total' })
        ])
      );
    });

    test('❌ No debe permitir crear orden con total inválido', async () => {
      const res = await request(app)
        .post('/api/paypal/create-order')
        .send({ total: -5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'total' })
        ])
      );
    });

    test('✅ Crear orden válida debe retornar ID y estado CREATED', async () => {
      const res = await request(app)
        .post('/api/paypal/create-order')
        .send({ total: 12.34 });

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: 'CREATED'
        })
      );
    });
  });

  describe('POST /api/paypal/capture-order', () => {
    test('❌ No debe permitir captura sin orderId', async () => {
      const res = await request(app)
        .post('/api/paypal/capture-order')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'orderId' })
        ])
      );
    });

    // Este test requiere una orden real creada y válida
    test.skip('✅ Captura orden válida', async () => {
      const createRes = await request(app)
        .post('/api/paypal/create-order')
        .send({ total: 15 });

      const orderId = createRes.body?.data?.id;

      if (!orderId) throw new Error('No se pudo crear orden de prueba');

      const res = await request(app)
        .post('/api/paypal/capture-order')
        .send({ orderId });

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'COMPLETED');
    });
  });
});
