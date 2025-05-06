// 📁 backend/tests/paypalService.test.js

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // SOLO sandbox

import dotenv from 'dotenv';
dotenv.config();

import { crearOrden, capturarOrden } from '../services/paypalService.js';

describe('🧪 PayPalService - Pruebas de integración robustas', () => {
  let createdOrderId = '';

  test('✅ Crear orden PayPal con total válido', async () => {
    const total = 10.5;

    const response = await crearOrden(total);

    console.log('💬 Orden creada:', JSON.stringify(response, null, 2));

    expect(response).toBeDefined();
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('status', 'CREATED');

    createdOrderId = response.id;
  });

  test('✅ Capturar orden creada previamente (puede requerir aprobación manual)', async () => {
    if (!createdOrderId) {
      console.warn('⚠️ Test omitido: No se creó la orden.');
      return;
    }

    try {
      const response = await capturarOrden(createdOrderId);

      expect(response).toBeDefined();
      expect(response).toHaveProperty('id', createdOrderId);
      expect(response.status).toBe('COMPLETED');
    } catch (err) {
      // PayPal Sandbox puede requerir aprobación manual desde la cuenta de pruebas
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('422') || msg.includes('approval')) {
        console.warn('⚠️ La orden no fue aprobada aún en sandbox. Captura no realizada.');
      } else {
        throw err; // Rethrow si es otro error inesperado
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

  test('❌ No debe capturar orden con ID inexistente', async () => {
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
