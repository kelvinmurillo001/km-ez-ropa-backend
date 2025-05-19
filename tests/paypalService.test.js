// 📁 backend/tests/paypalService.test.js

// ⚠️ SOLO para entorno sandbox (evita errores de certificados locales)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import dotenv from 'dotenv';
dotenv.config();

import { crearOrden, capturarOrden } from '../services/paypalService.js';

describe('🧪 Integración PayPalService (sandbox)', () => {
  let createdOrderId = '';

  test('✅ Debe crear orden válida con monto > 0', async () => {
    const total = 10.5;

    const response = await crearOrden(total);
    console.log('📝 Orden creada:', JSON.stringify(response, null, 2));

    expect(response).toBeDefined();
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('status', 'CREATED');

    createdOrderId = response.id;
  });

  test('✅ Capturar orden previamente creada (requiere aprobación previa)', async () => {
    if (!createdOrderId) {
      console.warn('⚠️ Prueba omitida: No se generó una orden previa.');
      return;
    }

    try {
      const result = await capturarOrden(createdOrderId);

      console.log('📦 Resultado captura:', result);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', createdOrderId);
      expect(result.status).toBe('COMPLETED');
    } catch (err) {
      const msg = (err.message || '').toLowerCase();

      if (msg.includes('422') || msg.includes('approval') || msg.includes('not authorized')) {
        console.warn('⚠️ Orden aún no aprobada. Captura omitida.');
      } else {
        throw err; // re-lanzar error si es inesperado
      }
    }
  });

  test('❌ No debe crear orden con total inválido (0)', async () => {
    expect.assertions(1);
    try {
      await crearOrden(0);
    } catch (err) {
      expect(err.message.toLowerCase()).toMatch(/total/i);
    }
  });

  test('❌ No debe capturar orden con ID no existente', async () => {
    expect.assertions(1);
    try {
      await capturarOrden('orden_inexistente_123');
    } catch (err) {
      expect(err.message.toLowerCase()).toMatch(/404|not found|paypal/i);
    }
  });

  test('❌ No debe capturar orden con ID vacío', async () => {
    expect.assertions(1);
    try {
      await capturarOrden('');
    } catch (err) {
      expect(err.message.toLowerCase()).toMatch(/orderid/i);
    }
  });
});
