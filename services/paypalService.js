// 📁 backend/services/paypalService.js

import axios from 'axios'
import https from 'https'
import config from '../config/configuracionesito.js'

// 🔐 Variables de entorno de PayPal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET
const PAYPAL_API = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'

// ⚠️ Validación inicial
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️ PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no definidos en .env')
}

// ⚡ Axios config para entorno de desarrollo
const isTesting = process.env.NODE_ENV !== 'production'
const axiosClient = isTesting
  ? axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
  : axios

// 🔑 Obtener token de acceso a PayPal
async function obtenerTokenPayPal () {
  try {
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

    const res = await axiosClient.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const token = res.data.access_token
    if (!token) throw new Error('Token vacío recibido de PayPal')

    // 👇 Solo para debug, puedes eliminar en producción
    console.log('✅ Token PayPal obtenido')

    return token
  } catch (error) {
    console.error('❌ Error obteniendo token PayPal:', error.message)
    throw new Error('Error al autenticar con PayPal. Verifica tus credenciales.')
  }
}

// 🛒 Crear una nueva orden en PayPal
export async function crearOrden (total) {
  try {
    if (!total || isNaN(total)) {
      throw new Error('Total inválido')
    }

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
  } catch (error) {
    console.error('❌ Error creando orden PayPal:', error.message)
    throw new Error('No se pudo crear la orden PayPal.')
  }
}

// 💵 Capturar una orden existente en PayPal
export async function capturarOrden (orderId) {
  try {
    if (!orderId) throw new Error('orderId es requerido')

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
  } catch (error) {
    console.error('❌ Error capturando orden PayPal:', error.message)
    throw new Error('No se pudo capturar la orden PayPal.')
  }
}
