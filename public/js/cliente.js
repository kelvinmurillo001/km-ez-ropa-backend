"use strict";

import {
  mostrarMensaje,
  getUsuarioSesionSeguro,
  cerrarSesionCliente
} from "./sesion-utils.js";

// 📌 DOM
const listaPedidos = document.getElementById("listaPedidos");
const saludo = document.getElementById("saludoUsuario");
const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
const filtroEstado = document.getElementById("filtroEstado");

// 🌐 Endpoint
const API_PEDIDOS = `/api/orders/mis-pedidos`;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const usuario = await getUsuarioSesionSeguro();
    if (!usuario) return;

    mostrarSaludo(usuario);
    await cargarPedidos();

    cerrarSesionBtn?.addEventListener("click", cerrarSesionCliente);
    filtroEstado?.addEventListener("change", cargarPedidos);
    aplicarModoOscuro();

  } catch (error) {
    console.error("❌ Error general en cliente.js:", error);
    mostrarMensaje("❌ Ocurrió un error inesperado.", "error");
  }
});

/* ───────────────────────────────────────────── */
/* 👤 Mostrar saludo personalizado               */
/* ───────────────────────────────────────────── */
function mostrarSaludo(usuario) {
  const nombre = sanitize(usuario.name || usuario.username || "Cliente");
  if (saludo) saludo.textContent = `👤 Hola, ${nombre}`;
}

/* ───────────────────────────────────────────── */
/* 🌙 Modo Oscuro                                */
/* ───────────────────────────────────────────── */
function aplicarModoOscuro() {
  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }
}

/* ───────────────────────────────────────────── */
/* 📦 Cargar pedidos del cliente                 */
/* ───────────────────────────────────────────── */
async function cargarPedidos() {
  if (!listaPedidos) return;

  listaPedidos.innerHTML = `<p class="text-center">⏳ Cargando pedidos...</p>`;
  const filtro = filtroEstado?.value?.trim().toLowerCase();

  try {
    const res = await fetch(API_PEDIDOS, { credentials: "include" });
    const data = await res.json();

    if (!res.ok || !Array.isArray(data.pedidos)) {
      throw new Error(data.message || "❌ No se pudieron cargar los pedidos.");
    }

    const pedidos = filtro
      ? data.pedidos.filter(p => (p.estado || "").toLowerCase() === filtro)
      : data.pedidos;

    if (!pedidos.length) {
      listaPedidos.innerHTML = `<p class="text-center">📭 No hay pedidos con ese estado.</p>`;
    } else {
      listaPedidos.innerHTML = pedidos.map(renderPedidoHTML).join("");
      agregarEventosDetalles();
    }

  } catch (err) {
    console.error("❌ Error al cargar pedidos:", err);
    listaPedidos.innerHTML = `<p class="text-center" style="color:red;">❌ ${sanitize(err.message)}</p>`;
  }
}

/* ───────────────────────────────────────────── */
/* 🧾 Renderizar pedido individual               */
/* ───────────────────────────────────────────── */
function renderPedidoHTML(pedido) {
  const fecha = pedido.createdAt
    ? new Date(pedido.createdAt).toLocaleDateString("es-EC")
    : "--";

  const estado = traducirEstado(pedido.estado);
  const total = `$${parseFloat(pedido.total || 0).toFixed(2)}`;
  const id = pedido._id?.slice(-6)?.toUpperCase() || "XXXXXX";

  return `
    <div class="pedido-card" data-id="${sanitize(pedido._id)}" role="region" aria-label="Pedido ${id}">
      <p><strong>Pedido:</strong> #${id}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Total:</strong> ${total}</p>
      <p><strong>Estado:</strong> 
        <span class="estado-${sanitize(pedido.estado || "otro")}">${estado}</span>
      </p>
      <button class="btn-secundario ver-detalles" aria-label="Ver detalles del pedido ${id}">👁️ Ver Detalles</button>
    </div>
  `;
}

/* ───────────────────────────────────────────── */
/* 🔍 Activar eventos para ver detalles          */
/* ───────────────────────────────────────────── */
function agregarEventosDetalles() {
  document.querySelectorAll(".ver-detalles").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.closest(".pedido-card")?.dataset?.id;
      if (id) window.location.href = `/detalle-pedido.html?id=${id}`;
    });
  });
}

/* ───────────────────────────────────────────── */
/* 🔁 Traducción legible de estado               */
/* ───────────────────────────────────────────── */
function traducirEstado(estado = "") {
  const map = {
    pendiente: "⏳ Pendiente",
    procesando: "🛠️ Procesando",
    preparando: "🛠️ Preparando",
    enviado: "🚚 Enviado",
    entregado: "📬 Entregado",
    cancelado: "❌ Cancelado"
  };
  return map[estado.toLowerCase()] || "🔘 Otro";
}

/* ───────────────────────────────────────────── */
/* 🧼 Sanitizar texto contra XSS                 */
/* ───────────────────────────────────────────── */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML.trim();
}
