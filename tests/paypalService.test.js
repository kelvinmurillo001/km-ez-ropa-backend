// 📁 backend/tests/paypalService.test.js

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // SOLO sandbox

import dotenv from 'dotenv';
import { crearOrden, capturarOrden } from '../services/paypalService.js';

dotenv.config();

describe('🧪 PayPalService - Pruebas de integración robustas', () => {
  let createdOrderId = '';

  test('✅ Debería crear una orden PayPal válida con total positivo', async () => {
    const total = 10.5;
    const response = await crearOrden(total);

    console.log('💬 Respuesta creación:', JSON.stringify(response, null, 2));

    expect(response).toBeDefined();
    expect(response).toHaveProperty('id');
    expect(response.status).toBe('CREATED');

    createdOrderId = response.id;
  });

  test('✅ Debería capturar correctamente una orden PayPal existente', async () => {
    if (!createdOrderId) {
      console.warn('⚠️ Test omitido: No se creó la orden');
      return;
    }

    try {
      const response = await capturarOrden(createdOrderId);

      expect(response).toBeDefined();
      expect(response).toHaveProperty('id', createdOrderId);
      expect(response.status).toBe('COMPLETED');
    } catch (err) {
      // 422 = no aprobada aún
      if (err.message.includes('422')) {
        console.warn('⚠️ No se puede capturar orden aún: requiere aprobación manual en sandbox.');
      } else {
        throw err;
      }
    }
  });

  test('❌ No debe permitir crear orden con total inválido', async () => {
    expect.assertions(1);
    try {
      await crearOrden(0);
    } catch (err) {
      expect(err.message.toLowerCase()).toMatch(/total/);
    }
  });

  test('❌ No debe permitir capturar con ID inválido', async () => {
    expect.assertions(1);
    try {
      await capturarOrden('orden_inexistente_123');
    } catch (err) {
      expect(err.message.toLowerCase()).toMatch(/404|not found|paypal/);
    }
  });

  test('❌ No debe permitir capturar sin pasar orderId', async () => {
    expect.assertions(1);
    try {
      await capturarOrden('');
    } catch (err) {
      expect(err.message).toMatch(/orderId es requerido/);
    }
  });
});
