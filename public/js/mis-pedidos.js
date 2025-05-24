// 📁 frontend/js/mis-pedidos.js
"use strict";

import { API_BASE } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("km_ez_token");

  if (!token || typeof token !== "string" || token.length < 20) {
    return mostrarError("🔐 Debes iniciar sesión para ver tus pedidos.");
  }

  cargarPedidos(token);
});

/**
 * 📦 Carga los pedidos del cliente autenticado
 */
async function cargarPedidos(token) {
  const contenedor = document.getElementById("misPedidosContainer");
  if (!contenedor) return;

  contenedor.setAttribute("aria-busy", "true");
  contenedor.innerHTML = `<p class="text-center">⏳ Cargando pedidos...</p>`;

  try {
    const res = await fetch(`${API_BASE}/api/orders/mis-pedidos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok || !Array.isArray(data.pedidos)) {
      throw new Error(data.message || "Error al obtener pedidos.");
    }

    const pedidos = data.pedidos;

    contenedor.innerHTML = pedidos.length
      ? pedidos.map(renderPedidoCard).join("")
      : `<p class="info text-center">📭 Aún no tienes pedidos realizados.</p>`;

  } catch (err) {
    console.error("❌ Error al cargar pedidos:", err);
    mostrarError("❌ No se pudieron cargar tus pedidos. Intenta nuevamente.");
  } finally {
    contenedor.setAttribute("aria-busy", "false");
  }
}

/**
 * 🧾 Renderiza visualmente un pedido
 */
function renderPedidoCard(p) {
  const fecha = new Date(p.createdAt).toLocaleDateString("es-EC", {
    year: "numeric", month: "short", day: "numeric"
  });

  const total = `$${Number(p.total || 0).toFixed(2)}`;
  const estado = estadoBonito(p.estado);
  const idCorto = sanitize(p._id?.slice(-6)?.toUpperCase() || "XXXXXX");

  const seguimiento = p.codigoSeguimiento
    ? `<a href="/seguimiento.html?codigo=${encodeURIComponent(p.codigoSeguimiento)}"
           class="btn"
           aria-label="Ver seguimiento del pedido #${idCorto}">📦 Ver seguimiento</a>`
    : `<span class="text-muted">🔍 Seguimiento no disponible</span>`;

  return `
    <div class="pedido-card fade-in" role="region" aria-label="Pedido #${idCorto}">
      <h3>📦 Pedido #${idCorto}</h3>
      <p><strong>📅 Fecha:</strong> ${fecha}</p>
      <p><strong>💰 Total:</strong> ${total}</p>
      <p><strong>📌 Estado:</strong> <span class="estado-${sanitize(p.estado)}">${estado}</span></p>
      <div class="acciones mt-1">${seguimiento}</div>
    </div>
  `;
}

/**
 * 🎨 Traduce el estado técnico a uno visual
 */
function estadoBonito(estado = "") {
  const estados = {
    pendiente: "⏳ Pendiente",
    procesando: "🛠️ En proceso",
    en_proceso: "⚙️ En proceso",
    preparando: "🛠️ Preparando",
    enviado: "🚚 Enviado",
    entregado: "📬 Entregado",
    cancelado: "❌ Cancelado",
    pagado: "💰 Pagado"
  };
  return estados[estado.toLowerCase()] || capitalize(estado);
}

/**
 * 🧼 Capitaliza una palabra
 */
function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 🛡️ Previene XSS
 */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.trim();
}

/**
 * 🚨 Mostrar mensaje de error accesible
 */
function mostrarError(msg) {
  const contenedor = document.getElementById("misPedidosContainer");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <p class="error text-center" role="alert" aria-live="assertive">
      ${sanitize(msg)}
    </p>`;
  contenedor.setAttribute("aria-busy", "false");
}
