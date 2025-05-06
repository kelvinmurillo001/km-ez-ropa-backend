import { sendNotification } from '../utils/sendNotification.js'
import nodemailer from 'nodemailer'

jest.mock('nodemailer')

describe('🧪 Envío de notificaciones por correo', () => {
  const mockSendMail = jest.fn()

  beforeAll(() => {
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    })
  })

  beforeEach(() => {
    mockSendMail.mockClear()
  })

  test('✅ Debería enviar correo de creación de pedido correctamente', async () => {
    mockSendMail.mockResolvedValueOnce({ accepted: ['cliente@correo.com'] })

    await sendNotification({
      email: 'cliente@correo.com',
      nombreCliente: 'Kelvin',
      estadoActual: 'pendiente',
      tipo: 'creacion'
    })

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.to).toBe('cliente@correo.com')
    expect(mail.subject).toMatch(/pedido recibido/i)
    expect(mail.html).toContain('Hemos recibido tu pedido')
    expect(mail.html).toContain('Kelvin')
  })

  test('✅ Debería enviar correo de actualización de estado correctamente', async () => {
    await sendNotification({
      email: 'cliente@test.com',
      nombreCliente: 'Ana',
      estadoActual: 'enviado'
    })

    expect(mockSendMail).toHaveBeenCalledTimes(1)
    const mail = mockSendMail.mock.calls[0][0]
    expect(mail.subject).toMatch(/estado/i)
    expect(mail.html).toContain('El estado de tu pedido ha sido actualizado')
    expect(mail.html).toContain('Ana')
    expect(mail.html).toContain('Enviado')
  })

  test('❌ No debe enviar si falta email o estadoActual', async () => {
    await sendNotification({ email: '', estadoActual: 'pendiente' })
    await sendNotification({ email: 'test@test.com' }) // sin estado

    expect(mockSendMail).not.toHaveBeenCalled()
  })

  test('❌ Debe registrar error si falla el envío', async () => {
    const errorMock = new Error('Simulado')
    mockSendMail.mockRejectedValueOnce(errorMock)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await sendNotification({
      email: 'fallo@correo.com',
      nombreCliente: 'Laura',
      estadoActual: 'cancelado'
    })

    expect(consoleSpy).toHaveBeenCalledWith('❌ Error al enviar correo:', 'Simulado')
    consoleSpy.mockRestore()
  })
})
