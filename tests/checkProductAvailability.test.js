// 📁 backend/tests/checkProductAvailability.test.js
import {
  checkVariantDisponible,
  verificarProductoAgotado
} from '../utils/checkProductAvailability.js'

describe('🧪 checkVariantDisponible()', () => {
  const variantes = [
    { talla: 'm', color: 'negro', stock: 10, activo: true },
    { talla: 'l', color: 'blanco', stock: 0, activo: true },
    { talla: 's', color: 'rojo', stock: 5, activo: false }
  ]

  test('✅ Variante válida y activa con stock suficiente', () => {
    const res = checkVariantDisponible(variantes, 'M', 'NEGRO', 2)
    expect(res.ok).toBe(true)
    expect(res.variante).toBeDefined()
    expect(res.variante.stock).toBe(10)
  })

  test('❌ Variante no encontrada', () => {
    const res = checkVariantDisponible(variantes, 'xl', 'azul')
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/no encontrada/i)
  })

  test('❌ Variante inactiva', () => {
    const res = checkVariantDisponible(variantes, 's', 'rojo')
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/inactiva/i)
  })

  test('❌ Variante con stock insuficiente', () => {
    const res = checkVariantDisponible(variantes, 'l', 'blanco', 1)
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/stock insuficiente/i)
  })

  test('❌ Talla o color faltante', () => {
    const res = checkVariantDisponible(variantes, '', '')
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/talla y color son requeridos/i)
  })

  test('❌ Cantidad inválida', () => {
    const res = checkVariantDisponible(variantes, 'm', 'negro', -1)
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/cantidad/i)
  })

  test('❌ Variants no es un array', () => {
    const res = checkVariantDisponible(null, 'm', 'negro')
    expect(res.ok).toBe(false)
    expect(res.message).toMatch(/no válida/i)
  })
})

describe('🧪 verificarProductoAgotado()', () => {
  test('✅ Producto agotado si no hay variantes', () => {
    expect(verificarProductoAgotado([])).toBe(true)
    expect(verificarProductoAgotado(null)).toBe(true)
  })

  test('✅ Producto agotado si todas inactivas', () => {
    const variantes = [
      { talla: 'm', color: 'negro', stock: 5, activo: false },
      { talla: 'l', color: 'blanco', stock: 0, activo: false }
    ]
    expect(verificarProductoAgotado(variantes)).toBe(true)
  })

  test('✅ Producto agotado si todas tienen stock 0', () => {
    const variantes = [
      { talla: 'm', color: 'negro', stock: 0, activo: true },
      { talla: 'l', color: 'blanco', stock: 0, activo: true }
    ]
    expect(verificarProductoAgotado(variantes)).toBe(true)
  })

  test('❌ Producto NO está agotado si alguna variante activa tiene stock', () => {
    const variantes = [
      { talla: 'm', color: 'negro', stock: 0, activo: false },
      { talla: 'l', color: 'blanco', stock: 2, activo: true }
    ]
    expect(verificarProductoAgotado(variantes)).toBe(false)
  })
})
