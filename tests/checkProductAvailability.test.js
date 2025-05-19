// 📁 backend/tests/unit/checkProductAvailability.test.js

import {
  checkVariantDisponible,
  verificarProductoAgotado
} from '../../utils/checkProductAvailability.js'; // ✅ Ruta corregida para pruebas unitarias

describe('🧪 Función: checkVariantDisponible()', () => {
  const variantesMock = [
    { talla: 'm', color: 'negro', stock: 10, activo: true },
    { talla: 'l', color: 'blanco', stock: 0, activo: true },
    { talla: 's', color: 'rojo', stock: 5, activo: false }
  ];

  test('✅ Variante válida y activa con stock suficiente', () => {
    const res = checkVariantDisponible(variantesMock, 'M', 'NEGRO', 2);
    expect(res.ok).toBe(true);
    expect(res.variante).toBeDefined();
    expect(res.variante.stock).toBeGreaterThanOrEqual(2);
  });

  test('❌ Variante no encontrada (combinación talla + color no existe)', () => {
    const res = checkVariantDisponible(variantesMock, 'xl', 'azul');
    expect(res.ok).toBe(false);
    expect(res.message.toLowerCase()).toMatch(/no encontrada/);
  });

  test('❌ Variante inactiva (activo: false)', () => {
    const res = checkVariantDisponible(variantesMock, 's', 'rojo');
    expect(res.ok).toBe(false);
    expect(res.message.toLowerCase()).toMatch(/inactiva/);
  });

  test('❌ Variante con stock insuficiente', () => {
    const res = checkVariantDisponible(variantesMock, 'l', 'blanco', 1);
    expect(res.ok).toBe(false);
    expect(res.message.toLowerCase()).toMatch(/stock insuficiente/);
  });

  test('❌ Talla o color faltante', () => {
    const res = checkVariantDisponible(variantesMock, '', '');
    expect(res.ok).toBe(false);
    expect(res.message.toLowerCase()).toMatch(/talla y color/);
  });

  test('❌ Cantidad inválida (negativa)', () => {
    const res = checkVariantDisponible(variantesMock, 'm', 'negro', -5);
    expect(res.ok).toBe(false);
    expect(res.message.toLowerCase()).toMatch(/cantidad inválida/);
  });

  test('❌ Variants no es un array', () => {
    const res = checkVariantDisponible(null, 'm', 'negro');
    expect(res.ok).toBe(false);
    expect(res.message.toLowerCase()).toMatch(/variantes no válidas/);
  });
});

describe('🧪 Función: verificarProductoAgotado()', () => {
  test.each([[], null, undefined])('✅ Producto agotado si no hay variantes (%p)', (value) => {
    expect(verificarProductoAgotado(value)).toBe(true);
  });

  test('✅ Producto agotado si todas las variantes están inactivas', () => {
    const variantes = [
      { talla: 'm', color: 'negro', stock: 3, activo: false },
      { talla: 'l', color: 'blanco', stock: 0, activo: false }
    ];
    expect(verificarProductoAgotado(variantes)).toBe(true);
  });

  test('✅ Producto agotado si todas tienen stock 0 aunque estén activas', () => {
    const variantes = [
      { talla: 'm', color: 'negro', stock: 0, activo: true },
      { talla: 'l', color: 'blanco', stock: 0, activo: true }
    ];
    expect(verificarProductoAgotado(variantes)).toBe(true);
  });

  test('❌ Producto NO está agotado si hay al menos una variante activa con stock > 0', () => {
    const variantes = [
      { talla: 's', color: 'azul', stock: 0, activo: true },
      { talla: 'xl', color: 'verde', stock: 2, activo: true }
    ];
    expect(verificarProductoAgotado(variantes)).toBe(false);
  });
});
