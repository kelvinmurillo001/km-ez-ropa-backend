// 📁 backend/tests/unit/paypalService.unit.test.js

import { jest } from '@jest/globals'; // ✅ IMPORT NECESARIO EN ESM
import axios from 'axios';
import paypalService, { crearOrden, capturarOrden } from '../../services/paypalService.js';

jest.mock('axios');

describe('🧪 paypalService.js (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearOrden()', () => {
    test('✅ debe crear una orden correctamente', async () => {
      const fakeToken = 'fake-token';
      const fakeOrder = {
        id: 'ORDER123',
        status: 'CREATED'
      };

      // Mock token
      axios.post.mockImplementationOnce(() =>
        Promise.resolve({ data: { access_token: fakeToken } })
      );

      // Mock creación de orden
      axios.post.mockImplementationOnce(() =>
        Promise.resolve({ data: fakeOrder })
      );

      const result = await crearOrden(25.99);
      expect(result).toEqual(fakeOrder);
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    test.each([0, -5, null, undefined, NaN])(
      '❌ debe rechazar crear orden con total inválido: %p',
      async (total) => {
        await expect(crearOrden(total)).rejects.toThrow(/total/i);
      }
    );

    test('❌ debe fallar si no se obtiene token', async () => {
      axios.post.mockRejectedValueOnce(new Error('Token error'));
      await expect(crearOrden(10)).rejects.toThrow(/paypal/i);
    });
  });

  describe('capturarOrden()', () => {
    test('✅ debe capturar una orden correctamente', async () => {
      const fakeToken = 'token-capture';
      const fakeCapture = { id: 'ORDER123', status: 'COMPLETED' };

      // Mock token
      axios.post.mockImplementationOnce(() =>
        Promise.resolve({ data: { access_token: fakeToken } })
      );

      // Mock captura
      axios.post.mockImplementationOnce(() =>
        Promise.resolve({ data: fakeCapture })
      );

      const result = await capturarOrden('ORDER123');
      expect(result).toEqual(fakeCapture);
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    test.each(['', '12', null, undefined])(
      '❌ debe rechazar capturar orden con ID inválido: %p',
      async (orderId) => {
        await expect(capturarOrden(orderId)).rejects.toThrow(/orderid/i);
      }
    );

    test('❌ debe fallar si no se obtiene token para captura', async () => {
      axios.post.mockRejectedValueOnce(new Error('token fail'));
      await expect(capturarOrden('ORDER321')).rejects.toThrow(/paypal/i);
    });
  });
});
