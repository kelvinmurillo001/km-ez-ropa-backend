// 📁 backend/services/paypalService.js
import axios from 'axios'
import https from 'https'

// 🔐 Configuración de entorno
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_API = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️ PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no definidos en .env')
}

// 🌐 Axios config especial para entornos de test
const isTesting = process.env.NODE_ENV !== 'production'
const axiosClient = isTesting
  ? axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) })
  : axios

/**
 * 🔑 Obtener token de acceso de PayPal
 */
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

    const token = response.data?.access_token
    if (!token) throw new Error('Token vacío recibido de PayPal')

    console.log('✅ Token de PayPal obtenido')
    return token
  } catch (err) {
    console.error('❌ Error al obtener token de PayPal:', err.response?.data || err.message)
    throw new Error('❌ Error al autenticar con PayPal. Revisa CLIENT_ID, SECRET y entorno')
  }
}

/**
 * 🛒 Crear una nueva orden PayPal
 * @param {number} total - Monto total de la orden
 */
export async function crearOrden (total) {
  try {
    if (!total || isNaN(total) || total <= 0) {
      throw new Error('❌ Total inválido para crear orden')
    }

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

/**
 * 💰 Capturar una orden ya creada
 * @param {string} orderId - ID de la orden PayPal
 */
export async function capturarOrden (orderId) {
  try {
    if (!orderId || typeof orderId !== 'string' || orderId.length < 5) {
      throw new Error('❌ orderId inválido')
    }

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
