// 📁 backend/tests/paypalService.test.js
import { crearOrden, capturarOrden } from '../services/paypalService.js';
import dotenv from 'dotenv';

dotenv.config(); // Cargamos variables del .env

describe('🧪 Pruebas de integración PayPalService', () => {

  let createdOrderId = '';

  test('Crear una orden de PayPal exitosamente', async () => {
    const total = 10.5;

    const response = await crearOrden(total);

    // Verificaciones
    expect(response).toHaveProperty('id');
    expect(response.status).toBe('CREATED');
    expect(response.purchase_units[0].amount.value).toBe(total.toFixed(2));

    createdOrderId = response.id; // Guardamos el ID para capturarla luego
    console.log('🧪 Orden creada ID:', createdOrderId);
  });

  test('Capturar una orden de PayPal exitosamente', async () => {
    if (!createdOrderId) {
      throw new Error('No se creó ninguna orden previamente.');
    }

    const response = await capturarOrden(createdOrderId);

    // Verificaciones
    expect(response).toHaveProperty('id');
    expect(response.status).toBe('COMPLETED');
    expect(response.id).toBe(createdOrderId);

    console.log('🧪 Orden capturada ID:', response.id);
  });

});
