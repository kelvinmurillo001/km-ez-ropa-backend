// 📁 backend/services/paypalService.js
import axios from 'axios'
import https from 'https'
import config from '../config/configuracionesito.js'

// 🔐 Variables de entorno de PayPal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_API = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️ PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no están definidos')
}

const isTesting = process.env.NODE_ENV !== 'production'
const axiosClient = isTesting
  ? axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) })
  : axios

// 🔑 Obtener token de acceso
async function obtenerTokenPayPal () {
  try {
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    const response = await axiosClient.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (!response.data?.access_token) {
      throw new Error('Token vacío recibido de PayPal')
    }

    return response.data.access_token
  } catch (err) {
    console.error('❌ Error al obtener token de PayPal:', err.response?.data || err.message)
    throw new Error('❌ No se pudo autenticar con PayPal. Verifica tus credenciales y entorno.')
  }
}

// 🛒 Crear orden
export async function crearOrden (total) {
  try {
    const token = await obtenerTokenPayPal()
    const response = await axiosClient.post(
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
    )

    return response.data
  } catch (err) {
    console.error('❌ Error creando orden en PayPal:', err.response?.data || err.message)
    throw new Error('❌ Fallo al crear orden en PayPal')
  }
}

// 💵 Capturar orden
export async function capturarOrden (orderId) {
  try {
    const token = await obtenerTokenPayPal()
    const response = await axiosClient.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (err) {
    console.error('❌ Error capturando orden en PayPal:', err.response?.data || err.message)
    throw new Error('❌ Fallo al capturar orden en PayPal')
  }
}
