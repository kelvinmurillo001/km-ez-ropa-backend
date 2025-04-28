// 📁 services/paypalService.js
import axios from 'axios';
import config from '../config/configuracionesito.js';

// 📦 Extraemos datos de PayPal desde configuración centralizada
const { PAYPAL_API_BASE, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = config;

// 🔐 Autenticación básica para PayPal API
const auth = {
  username: PAYPAL_CLIENT_ID,
  password: PAYPAL_CLIENT_SECRET,
};

/**
 * 🛍️ Crear una nueva orden en PayPal
 * @param {number} total - Monto total de la orden
 * @returns {Promise<object>} - Datos de la orden creada
 */
export async function crearOrden(total) {
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
            },
          },
        ],
      },
      { auth }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear orden PayPal:', error.message);
    throw new Error('Error al crear orden PayPal');
  }
}

/**
 * 💵 Capturar una orden existente en PayPal
 * @param {string} orderId - ID de la orden a capturar
 * @returns {Promise<object>} - Datos de la captura de la orden
 */
export async function capturarOrden(orderId) {
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      { auth }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error al capturar orden PayPal:', error.message);
    throw new Error('Error al capturar orden PayPal');
  }
}
