// 📁 backend/tests/paypalService.test.js

// ⚠️ Ignorar SSL para entorno sandbox (NO usar en producción)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import dotenv from 'dotenv';
import { crearOrden, capturarOrden } from '../services/paypalService.js';

dotenv.config();

describe('🧪 Pruebas de integración PayPalService', () => {
  let createdOrderId = '';

  test('✅ Crear una orden de PayPal exitosamente', async () => {
    const total = 10.5;

    const response = await crearOrden(total);

    expect(response).toHaveProperty('id');
    expect(response.status).toBe('CREATED');
    expect(response.purchase_units?.[0]?.amount?.value).toBe(total.toFixed(2));

    createdOrderId = response.id;
    console.log('🧪 Orden creada ID:', createdOrderId);
  });

  test('✅ Capturar una orden de PayPal exitosamente', async () => {
    if (!createdOrderId) throw new Error('❌ No se creó ninguna orden previamente.');

    const response = await capturarOrden(createdOrderId);

    expect(response).toHaveProperty('id');
    expect(response.status).toBe('COMPLETED');
    expect(response.id).toBe(createdOrderId);

    console.log('🧪 Orden capturada ID:', response.id);
  });

  test('❌ Crear orden con total inválido', async () => {
    expect.assertions(1);
    try {
      await crearOrden(0); // total inválido
    } catch (err) {
      expect(err.message).toMatch(/total/i);
    }
  });

  test('❌ Capturar orden con ID inválido', async () => {
    expect.assertions(1);
    try {
      await capturarOrden('orden_inexistente_123');
    } catch (err) {
      expect(err.message).toMatch(/paypal/i);
    }
  });

  test('❌ Capturar sin pasar ID', async () => {
    expect.assertions(1);
    try {
      await capturarOrden('');
    } catch (err) {
      expect(err.message).toMatch(/orderId es requerido/);
    }
  });
});
