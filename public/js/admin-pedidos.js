// 📁 backend/public/js/admin-pedidos.js
"use strict";

import { API_BASE } from "./config.js";
import { mostrarMensaje } from "./admin-utils.js";

// 📌 Endpoints y elementos del DOM
const API_ORDERS = `${API_BASE}/api/orders`;
const tablaPedidos = document.getElementById("tablaPedidos");

// ▶️ Iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarPedidos();
});

/**
 * 🚚 Obtener pedidos del backend con token válido
 */
async function cargarPedidos() {
  const token = localStorage.getItem("admin_token");

  if (!token || token.length < 10) {
    mostrarMensaje("❌ Token de administrador no válido o ausente.", "error");
    return;
  }

  try {
    const res = await fetch(API_ORDERS, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener pedidos");

    renderPedidos(data.data || []);
  } catch (err) {
    console.error("❌ Error al cargar pedidos:", err);
    mostrarMensaje("❌ No se pudieron obtener los pedidos. Intenta más tarde.", "error");
  }
}

/**
 * 📋 Renderiza la tabla de pedidos
 * @param {Array} pedidos 
 */
function renderPedidos(pedidos = []) {
  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    tablaPedidos.innerHTML = `<p class="text-center text-warn">📭 No hay pedidos registrados aún.</p>`;
    return;
  }

  const filas = pedidos.map(p => {
    const nombre = sanitize(p.nombreCliente || "—");
    const fecha = new Date(p.createdAt).toLocaleDateString("es-EC");
    const total = `$${parseFloat(p.total || 0).toFixed(2)}`;
    const estado = sanitize(p.estado || "pendiente");

    return `
      <tr data-id="${p._id}">
        <td>${nombre}</td>
        <td>${total}</td>
        <td><span class="estado-${estado.toLowerCase()}">${estado}</span></td>
        <td>${fecha}</td>
        <td>
          <button class="btn btn-peq btn-rojo eliminar-btn" aria-label="Eliminar pedido de ${nombre}">🗑️</button>
        </td>
      </tr>`;
  }).join("");

  tablaPedidos.innerHTML = `
    <table class="tabla fade-in" aria-label="Listado de pedidos">
      <thead>
        <tr>
          <th scope="col">Cliente</th>
          <th scope="col">Total</th>
          <th scope="col">Estado</th>
          <th scope="col">Fecha</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

/**
 * 🧹 Sanitiza texto para evitar XSS
 */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML.trim();
}

/**
 * ❌ Eliminar un pedido con confirmación
 */
tablaPedidos.addEventListener("click", async (e) => {
  const btn = e.target.closest(".eliminar-btn");
  if (!btn) return;

  const fila = btn.closest("tr");
  const pedidoId = fila?.dataset?.id;
  if (!pedidoId) return;

  const confirmacion = confirm("⚠️ ¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.");
  if (!confirmacion) return;

  try {
    const res = await fetch(`${API_ORDERS}/${pedidoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      },
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al eliminar el pedido");

    mostrarMensaje("✅ Pedido eliminado exitosamente.", "success");
    cargarPedidos(); // Refrescar tabla
  } catch (err) {
    console.error("❌ Error al eliminar pedido:", err);
    mostrarMensaje("❌ No se pudo eliminar el pedido. Intenta nuevamente.", "error");
  }
});
