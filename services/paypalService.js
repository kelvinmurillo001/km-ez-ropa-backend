// 📁 backend/services/paypalService.js
import axios from 'axios';
import https from 'https';
import logger from '../utils/logger.js';

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_API_BASE,
  NODE_ENV
} = process.env;

const PAYPAL_API = PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

// 🚨 Verificación de credenciales
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  logger.warn('⚠️ Falta configuración de PayPal: CLIENT_ID y/o CLIENT_SECRET no definidos.');
}

// 🌐 Axios seguro para entorno local
const axiosClient = NODE_ENV !== 'production'
  ? axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) })
  : axios;

/**
 * 🔑 Solicita un token de acceso Bearer a PayPal
 */
async function obtenerTokenPayPal() {
  try {
    const authHeader = Buffer
      .from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
      .toString('base64');

    const res = await axiosClient.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const token = res.data?.access_token;
    if (!token || typeof token !== 'string') {
      throw new Error('❌ Token de PayPal no recibido o inválido');
    }

    logger.info('✅ Token PayPal obtenido correctamente');
    return token;
  } catch (err) {
    logger.error('❌ Error autenticando con PayPal:', err.response?.data || err.message);
    throw new Error('❌ Error autenticando con PayPal: ' + (err.response?.data?.error_description || err.message));
  }
}

/**
 * 🛒 Crea una orden PayPal
 * @param {number} total - Monto total de la compra
 */
export async function crearOrden(total) {
  if (!total || isNaN(total) || total <= 0) {
    throw new Error('❌ Total inválido: debe ser un número mayor a 0');
  }

  try {
    logger.info(`💳 Creando orden PayPal por $${total.toFixed(2)}`);
    const token = await obtenerTokenPayPal();

    const res = await axiosClient.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2)
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.data?.id) {
      logger.warn('⚠️ Orden PayPal creada sin ID válido:', res.data);
    }

    return res.data;
  } catch (err) {
    logger.error('❌ Error creando orden PayPal:', err.response?.data || err.message);
    throw new Error('❌ Error creando orden PayPal: ' + (err.response?.data?.message || err.message));
  }
}

/**
 * 💳 Captura una orden PayPal
 * @param {string} orderId - ID de la orden
 */
export async function capturarOrden(orderId) {
  if (!orderId || typeof orderId !== 'string' || orderId.length < 5) {
    throw new Error('❌ orderId inválido para captura');
  }

  try {
    logger.info(`💰 Capturando orden PayPal: ${orderId}`);
    const token = await obtenerTokenPayPal();

    const res = await axiosClient.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.data?.status) {
      logger.warn('⚠️ Captura sin status en respuesta:', res.data);
    }

    return res.data;
  } catch (err) {
    logger.error('❌ Error capturando orden PayPal:', err.response?.data || err.message);
    throw new Error('❌ Error capturando orden PayPal: ' + (err.response?.data?.message || err.message));
  }
}

// ✅ Export default
export default {
  crearOrden,
  capturarOrden
};
