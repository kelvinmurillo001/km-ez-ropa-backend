// 📁 backend/services/paypalService.js
import axios from 'axios'
import https from 'https'

// 🔐 Configuración de entorno
const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_API_BASE,
  NODE_ENV
} = process.env

const PAYPAL_API = PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️ Falta configuración de PayPal: revisa CLIENT_ID y CLIENT_SECRET')
}

// 🌐 Axios seguro para entornos de desarrollo
const axiosClient = NODE_ENV !== 'production'
  ? axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) })
  : axios

/**
 * 🔑 Obtener token de acceso de PayPal
 * @returns {Promise<string>} Token Bearer de PayPal
 */
async function obtenerTokenPayPal() {
  try {
    const authHeader = Buffer
      .from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
      .toString('base64')

    const res = await axiosClient.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const token = res.data?.access_token
    if (!token) throw new Error('❌ Token de PayPal no recibido')

    console.log('✅ Token de PayPal generado')
    return token
  } catch (err) {
    console.error('❌ Error autenticando con PayPal:', err.response?.data || err.message)
    throw new Error('⚠️ Error al obtener token PayPal. Verifica credenciales y entorno.')
  }
}

/**
 * 🛒 Crear una orden en PayPal
 * @param {number} total - Monto total de la compra
 * @returns {Promise<Object>} Objeto con detalles de la orden
 */
export async function crearOrden(total) {
  if (!total || isNaN(total) || total <= 0) {
    throw new Error('❌ Monto total inválido para crear orden')
  }

  try {
    const token = await obtenerTokenPayPal()

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
    )

    return res.data
  } catch (err) {
    console.error('❌ Error creando orden PayPal:', err.response?.data || err.message)
    throw new Error('⚠️ No se pudo crear la orden en PayPal')
  }
}

/**
 * 💳 Capturar una orden de PayPal existente
 * @param {string} orderId - ID de orden
 * @returns {Promise<Object>} Resultado de la captura
 */
export async function capturarOrden(orderId) {
  if (!orderId || typeof orderId !== 'string' || orderId.length < 5) {
    throw new Error('❌ orderId inválido para captura')
  }

  try {
    const token = await obtenerTokenPayPal()

    const res = await axiosClient.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return res.data
  } catch (err) {
    console.error('❌ Error capturando orden PayPal:', err.response?.data || err.message)
    throw new Error('⚠️ No se pudo capturar la orden de PayPal')
  }
}
