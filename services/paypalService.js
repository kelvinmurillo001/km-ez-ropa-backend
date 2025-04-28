// 📁 backend/services/paypalService.js

import axios from 'axios';
import https from 'https'; // ⬅️ Importamos 'https' para ignorar SSL en desarrollo
import config from '../config/configuracionesito.js';

// 🔐 Variables de PayPal (deberían estar en .env)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com'; // Sandbox por defecto

// ⚠️ Instancia de Axios para ignorar SSL en local/testing
// ❗ IMPORTANTE: Eliminar o condicionar solo para entornos de desarrollo
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// ✅ Según entorno usamos axios seguro o relajado
const isTesting = process.env.NODE_ENV !== 'production'; 
const axiosClient = isTesting ? axiosInstance : axios;

// 🔑 Obtener token de acceso a PayPal
async function obtenerTokenPayPal() {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const res = await axiosClient.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return res.data.access_token;
}

// 🛒 Crear una nueva orden
export async function crearOrden(total) {
  const token = await obtenerTokenPayPal();

  const res = await axiosClient.post(`${PAYPAL_API}/v2/checkout/orders`, {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: total.toFixed(2)
        }
      }
    ]
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
}

// 💵 Capturar una orden existente
export async function capturarOrden(orderId) {
  const token = await obtenerTokenPayPal();

  const res = await axiosClient.post(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
}
