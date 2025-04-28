// 📁 backend/tests/paypalService.test.js

// ⚠️ Solo para testing local: Ignorar errores SSL auto-firmados (PayPal sandbox)
// ❗ IMPORTANTE: Eliminar esta línea en producción real
import dotenv from 'dotenv'
import { crearOrden, capturarOrden } from '../services/paypalService.js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

dotenv.config() // 🔄 Cargar variables del entorno

describe('🧪 Pruebas de integración PayPalService', () => {
  let createdOrderId = ''

  test('Crear una orden de PayPal exitosamente', async () => {
    const total = 10.5

    const response = await crearOrden(total)

    // ✅ Verificaciones
    expect(response).toHaveProperty('id')
    expect(response.status).toBe('CREATED')
    expect(response.purchase_units[0].amount.value).toBe(total.toFixed(2))

    createdOrderId = response.id // Guardamos el ID para la siguiente prueba
    console.log('🧪 Orden creada ID:', createdOrderId)
  })

  test('Capturar una orden de PayPal exitosamente', async () => {
    if (!createdOrderId) {
      throw new Error('❌ No se creó ninguna orden previamente.')
    }

    const response = await capturarOrden(createdOrderId)

    // ✅ Verificaciones
    expect(response).toHaveProperty('id')
    expect(response.status).toBe('COMPLETED')
    expect(response.id).toBe(createdOrderId)

    console.log('🧪 Orden capturada ID:', response.id)
  })
})
