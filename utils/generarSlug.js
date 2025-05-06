import generarSlug from '../utils/generarSlug.js'

describe('🧪 generarSlug()', () => {
  test('✅ Convierte texto básico a kebab-case', () => {
    expect(generarSlug('Mi Producto Nuevo')).toBe('mi-producto-nuevo')
  })

  test('✅ Elimina tildes y signos diacríticos', () => {
    expect(generarSlug('Camiseta básica con acéntos')).toBe('camiseta-basica-con-acentos')
  })

  test('✅ Reemplaza ñ por n', () => {
    expect(generarSlug('Diseño español')).toBe('diseno-espanol')
  })

  test('✅ Elimina símbolos especiales', () => {
    expect(generarSlug('Playera #1 (edición limitada)!')).toBe('playera-1-edicion-limitada')
  })

  test('✅ Reduce múltiples espacios y guiones', () => {
    expect(generarSlug('   Producto    con   muchos   espacios   ')).toBe('producto-con-muchos-espacios')
    expect(generarSlug('Producto---con---guiones')).toBe('producto-con-guiones')
  })

  test('✅ Limita longitud máxima a 100 caracteres', () => {
    const largo = 'a'.repeat(150)
    const slug = generarSlug(largo)
    expect(slug.length).toBeLessThanOrEqual(100)
  })

  test('❌ Retorna cadena vacía si no es string', () => {
    expect(generarSlug(null)).toBe('')
    expect(generarSlug(undefined)).toBe('')
    expect(generarSlug(12345)).toBe('')
    expect(generarSlug({})).toBe('')
  })

  test('✅ Permite números dentro del slug', () => {
    expect(generarSlug('Camiseta Talla 42')).toBe('camiseta-talla-42')
  })

  test('✅ Slug vacío si el texto no tiene caracteres válidos', () => {
    expect(generarSlug('🧨💥🌟🤖🚀')).toBe('')
  })
})
