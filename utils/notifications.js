import { sendNotification } from '../utils/notifications.js'

describe('🧪 Notificaciones - Simulación de envío', () => {
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('✅ Enviar notificación con todos los datos', async () => {
    await sendNotification({
      nombreCliente: 'Kelvin',
      telefono: '0999999999',
      email: 'kelvin@test.com',
      estadoActual: 'preparando'
    })

    expect(consoleLog).toHaveBeenCalledWith(
      '📲 WhatsApp a 0999999999: 🛠️ Hola Kelvin, estamos preparando tu pedido.'
    )
    expect(consoleLog).toHaveBeenCalledWith(
      '📧 Email a kelvin@test.com: [Actualización de tu Pedido] 🛠️ Hola Kelvin, estamos preparando tu pedido.'
    )
    expect(consoleLog).toHaveBeenCalledWith('✅ Notificaciones enviadas correctamente.')
  })

  test('⚠️ Mostrar advertencia si falta teléfono o email', async () => {
    await sendNotification({
      nombreCliente: 'Ana',
      telefono: '',
      email: '',
      estadoActual: 'en camino'
    })

    expect(consoleWarn).toHaveBeenCalledWith('⚠️ No hay número de teléfono para enviar WhatsApp.')
    expect(consoleWarn).toHaveBeenCalledWith('⚠️ No hay correo para enviar Email.')
  })

  test('📦 Mensaje genérico si el estado no es reconocido', async () => {
    await sendNotification({
      nombreCliente: 'Luis',
      telefono: '0999999999',
      email: 'luis@test.com',
      estadoActual: 'pendiente'
    })

    expect(consoleLog).toHaveBeenCalledWith(
      '📲 WhatsApp a 0999999999: 📦 Hola Luis, actualización de tu pedido.'
    )
  })

  test('❌ Manejar errores sin crashear', async () => {
    const errorMock = jest.fn(() => {
      throw new Error('Fallo simulado')
    })

    // Sobrescribir temporalmente enviarWhatsapp o enviarEmail
    const { __RewireAPI__ } = await import('../utils/notifications.js')
    __RewireAPI__.__Rewire__('enviarWhatsapp', errorMock)

    await sendNotification({
      nombreCliente: 'Laura',
      telefono: '1234567890',
      email: 'laura@test.com',
      estadoActual: 'recibido'
    })

    expect(consoleError).toHaveBeenCalledWith(
      '❌ Error enviando notificaciones:',
      'Fallo simulado'
    )

    __RewireAPI__.__ResetDependency__('enviarWhatsapp')
  })
})
