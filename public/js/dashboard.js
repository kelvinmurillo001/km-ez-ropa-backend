"use strict";

import { verificarSesion, goBack, mostrarMensaje } from "./admin-utils.js";
import { API_BASE } from "./config.js";

// 🌐 Endpoints
const API_ORDERS = `${API_BASE}/api/orders`;
const API_PRODUCTS = `${API_BASE}/api/products`;
const API_RESUMEN = `${API_BASE}/api/orders/stats/ventas`;

// 📦 Estado global
let resumenPedidos = null;
let resumenVentas = null;
let categoriasOrdenadas = [];

// ▶️ Inicio
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = await verificarSesion();
    if (!token) throw new Error("🔐 Token inválido o expirado");

    await cargarDashboard(token);
    document.getElementById("btnExportar")?.addEventListener("click", () => exportarEstadisticas(token));
  } catch (err) {
    mostrarMensaje(err.message || "⚠️ Error de sesión", "error");
    window.location.href = "/login.html";
  }
});

/* 🚀 Cargar datos principales del dashboard */
async function cargarDashboard(token) {
  try {
    const [ordenes, productos, resumen] = await Promise.all([
      fetchAPI(API_ORDERS, token),
      fetchAPI(API_PRODUCTS, token),
      fetchAPI(API_RESUMEN, token)
    ]);

    const pedidos = Array.isArray(ordenes?.data) ? ordenes.data : [];
    const listaProductos = Array.isArray(productos?.productos) ? productos.productos : [];
    const datosResumen = typeof resumen === "object" && resumen !== null ? resumen : {};

    resumenPedidos = procesarPedidos(pedidos);
    resumenVentas = {
      ventasTotales: parseFloat(datosResumen.ventasTotales || 0),
      totalVisitas: datosResumen.totalVisitas || 0,
      totalProductos: listaProductos.length,
      productosDestacados: listaProductos.filter(p => p.featured).length
    };

    renderResumen(resumenPedidos, resumenVentas);
    renderCategoriasTop(listaProductos);
  } catch (err) {
    console.error("❌ Error en dashboard:", err);
    mostrarMensaje("❌ No se pudo cargar el dashboard", "error");
  }
}

/* 🌐 Fetch con token */
async function fetchAPI(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error al acceder a ${url}`);
  return data;
}

/* 📊 Contar pedidos por estado */
function procesarPedidos(pedidos = []) {
  const hoy = new Date().setHours(0, 0, 0, 0);
  return pedidos.reduce((acc, p) => {
    const estado = (p.estado || "").toLowerCase();
    const fecha = new Date(p.createdAt).setHours(0, 0, 0, 0);
    if (estado.includes("pend")) acc.pendiente++;
    else if (estado.includes("proceso")) acc.en_proceso++;
    else if (estado.includes("env")) acc.enviado++;
    else if (estado.includes("cancel")) acc.cancelado++;
    if (fecha === hoy) acc.hoy++;
    acc.total++;
    return acc;
  }, {
    pendiente: 0,
    en_proceso: 0,
    enviado: 0,
    cancelado: 0,
    hoy: 0,
    total: 0
  });
}

/* 📈 Mostrar métricas */
function renderResumen(pedidos, ventas) {
  setText("ventasTotales", `$${ventas.ventasTotales.toFixed(2)}`);
  setText("visitasTotales", ventas.totalVisitas);
  setText("totalProductos", ventas.totalProductos);
  setText("promosActivas", ventas.productosDestacados);

  setText("total", pedidos.total);
  setText("pendientes", pedidos.pendiente);
  setText("en_proceso", pedidos.en_proceso);
  setText("enviado", pedidos.enviado);
  setText("cancelado", pedidos.cancelado);
  setText("hoy", pedidos.hoy);
}

/* 🗂️ Categorías con más productos */
function renderCategoriasTop(productos = []) {
  const conteo = {};
  productos.forEach(p => {
    const cat = (p.category || "sin categoría").trim().toLowerCase();
    conteo[cat] = (conteo[cat] || 0) + 1;
  });

  categoriasOrdenadas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const ul = document.getElementById("topCategorias");
  ul.innerHTML = "";

  categoriasOrdenadas.forEach(([nombre, total]) => {
    const li = document.createElement("li");
    li.textContent = `📁 ${capitalize(nombre)}: ${total}`;
    ul.appendChild(li);
  });
}

/* 📤 Exportar CSV */
function exportarEstadisticas() {
  if (!resumenPedidos || !resumenVentas) {
    mostrarMensaje("⚠️ Espera a que cargue toda la información", "info");
    return;
  }

  const fecha = new Date().toLocaleString("es-EC");
  let csv = `Dashboard KM & EZ ROPA\nFecha:,${fecha}\n\n`;

  csv += "Resumen de Ventas\n";
  csv += `Ventas Totales,${resumenVentas.ventasTotales}\n`;
  csv += `Visitas Totales,${resumenVentas.totalVisitas}\n`;
  csv += `Productos Totales,${resumenVentas.totalProductos}\n`;
  csv += `Promociones Activas,${resumenVentas.productosDestacados}\n\n`;

  csv += "Resumen de Pedidos\n";
  Object.entries(resumenPedidos).forEach(([k, v]) => {
    csv += `${capitalize(k)},${v}\n`;
  });

  csv += "\nTop Categorías\n";
  categoriasOrdenadas.forEach(([cat, count]) => {
    csv += `${capitalize(cat)},${count}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard_km-ez-ropa_${Date.now()}.csv`;
  a.click();
}

/* 🧼 Utilidades */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🌍 Global
window.goBack = goBack;
