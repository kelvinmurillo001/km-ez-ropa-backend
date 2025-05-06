import logger from '../utils/logger.js'

describe('🧪 logger utils', () => {
  const originalEnv = process.env.NODE_ENV
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  const consoleDebug = jest.spyOn(console, 'debug').mockImplementation(() => {})

  afterEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = originalEnv
  })

  test('✅ logger.info debe llamar console.log con prefijo', () => {
    logger.info('Mensaje info')
    expect(consoleLog).toHaveBeenCalledWith('[KM-EZ ROPA] ✅', 'Mensaje info')
  })

  test('⚠️ logger.warn debe llamar console.warn con prefijo', () => {
    logger.warn('Mensaje warning')
    expect(consoleWarn).toHaveBeenCalledWith('[KM-EZ ROPA] ⚠️', 'Mensaje warning')
  })

  test('❌ logger.error debe llamar console.error con prefijo', () => {
    logger.error('Mensaje error')
    expect(consoleError).toHaveBeenCalledWith('[KM-EZ ROPA] ❌', 'Mensaje error')
  })

  test('🐞 logger.debug SOLO imprime en modo development', () => {
    process.env.NODE_ENV = 'development'
    logger.debug('Mensaje debug')
    expect(consoleDebug).toHaveBeenCalledWith('[KM-EZ ROPA] 🐞', 'Mensaje debug')
  })

  test('🚫 logger.debug NO imprime en modo producción', () => {
    process.env.NODE_ENV = 'production'
    logger.debug('Mensaje oculto')
    expect(consoleDebug).not.toHaveBeenCalled()
  })
})
