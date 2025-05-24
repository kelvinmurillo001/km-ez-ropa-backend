"use strict";

// 🔐 Utilidades comunes
import { verificarSesion, goBack, mostrarMensaje } from "./admin-utils.js";
import { API_BASE } from "./config.js";

// 🌐 Endpoints
const API_ORDERS = `${API_BASE}/api/orders`;

// 📌 DOM
const listaPedidos = document.getElementById("listaPedidos");
const filtroEstado = document.getElementById("filtroEstado");
const btnExportar = document.getElementById("btnExportarPedidos");
const paginacion = document.getElementById("paginacionPedidos");
const estadisticasVentas = document.getElementById("estadisticasVentas");

// 🛡️ Token
const token = verificarSesion();
if (!token) throw new Error("❌ Token no disponible");

let todosLosPedidos = [];
let paginaActual = 1;
const pedidosPorPagina = 10;
const ESTADOS_VALIDOS = ["pendiente", "en_proceso", "enviado", "pagado", "cancelado"];

document.addEventListener("DOMContentLoaded", () => {
  cargarPedidos();

  filtroEstado?.addEventListener("change", () => {
    paginaActual = 1;
    renderPedidos();
  });

  btnExportar?.addEventListener("click", exportarPDF);

  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }
});

/* 📥 Obtener pedidos */
async function cargarPedidos() {
  try {
    const res = await fetch(API_ORDERS, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener pedidos");

    todosLosPedidos = Array.isArray(data.data) ? data.data : [];
    renderPedidos();
  } catch (err) {
    console.error("❌ Error cargando pedidos:", err.message);
    listaPedidos.innerHTML = `<p class="text-center" style="color:red;">❌ No se pudo cargar los pedidos</p>`;
  }
}

/* 📋 Render de pedidos */
function renderPedidos() {
  const pedidosFiltrados = aplicarFiltro(todosLosPedidos);
  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / pedidosPorPagina));
  paginaActual = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaActual - 1) * pedidosPorPagina;
  const pagina = pedidosFiltrados.slice(inicio, inicio + pedidosPorPagina).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderEstadisticas(pedidosFiltrados);
  renderPaginacion(totalPaginas);

  if (!pagina.length) {
    listaPedidos.innerHTML = `<p class="text-center">📭 No hay pedidos con este estado.</p>`;
    return;
  }

  listaPedidos.innerHTML = `
    <table class="tabla-admin fade-in" aria-label="Listado de pedidos">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Nota</th>
          <th>Fecha</th>
          <th>Productos</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${pagina.map(renderFilaPedido).join("")}
      </tbody>
    </table>`;
}

/* 🧾 Fila por pedido */
function renderFilaPedido(p) {
  const productos = Array.isArray(p.items)
    ? p.items.map(i => `👕 <strong>${sanitize(i.name)}</strong> (${sanitize(i.talla)}) x${i.cantidad}`).join("<br>")
    : "-";

  const total = typeof p.total === "number" ? `$${p.total.toFixed(2)}` : "$0.00";
  const fecha = new Date(p.createdAt).toLocaleString("es-EC", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const cliente = sanitize(p.nombreCliente || "Sin nombre");
  const nota = sanitize(p.nota || "-");
  const linkWA = ["transferencia", "efectivo"].includes(p.metodoPago) ? generarLinkWhatsapp(p) : "";

  return `
    <tr>
      <td>${cliente}</td>
      <td>${nota}</td>
      <td>${fecha}</td>
      <td>${productos}</td>
      <td>${total}</td>
      <td>${formatearEstado(p.estado)}</td>
      <td>
        <select onchange="cambiarEstado('${p._id}', this)" class="select-estado">
          ${generarOpcionesEstado(p.estado)}
        </select>
        ${linkWA}
      </td>
    </tr>`;
}

/* 📊 Estadísticas globales */
function renderEstadisticas(pedidos) {
  const total = pedidos.length;
  const totalVentas = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const enviados = pedidos.filter(p => (p.estado || "").toLowerCase() === "enviado").length;
  const pendientes = pedidos.filter(p => (p.estado || "").toLowerCase() === "pendiente").length;
  const pagados = pedidos.filter(p => (p.estado || "").toLowerCase() === "pagado").length;

  estadisticasVentas.innerHTML = `
    <p><strong>Total pedidos:</strong> ${total}</p>
    <p><strong>Ventas acumuladas:</strong> $${totalVentas.toFixed(2)}</p>
    <p><strong>Pagados:</strong> ${pagados}</p>
    <p><strong>Enviados:</strong> ${enviados}</p>
    <p><strong>Pendientes:</strong> ${pendientes}</p>`;
}

/* ⏩ Paginación */
function renderPaginacion(totalPaginas) {
  paginacion.innerHTML = "";
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === paginaActual ? "btn paginacion-activa" : "btn-secundario";
    btn.addEventListener("click", () => {
      paginaActual = i;
      renderPedidos();
    });
    paginacion.appendChild(btn);
  }
}

/* 🔎 Filtro por estado */
function aplicarFiltro(pedidos = []) {
  const estado = filtroEstado?.value || "todos";
  return estado === "todos"
    ? pedidos
    : pedidos.filter(p => (p.estado || "").toLowerCase() === estado.toLowerCase());
}

/* 🔄 Cambiar estado */
window.cambiarEstado = async (id, selectElem) => {
  const nuevoEstado = selectElem.value;
  if (!nuevoEstado || !ESTADOS_VALIDOS.includes(nuevoEstado)) return;

  selectElem.disabled = true;

  try {
    const res = await fetch(`${API_ORDERS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al actualizar estado");

    mostrarMensaje("✅ Estado actualizado correctamente", "success");
    await cargarPedidos();
  } catch (err) {
    console.error("❌", err.message);
    mostrarMensaje("❌ No se pudo cambiar el estado", "error");
  } finally {
    selectElem.disabled = false;
  }
};

/* 📄 Exportar PDF con jsPDF */
async function exportarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Resumen de Pedidos", 14, 20);

    const filas = todosLosPedidos.map(p => [
      sanitize(p.nombreCliente),
      `$${p.total?.toFixed(2) || "0.00"}`,
      new Date(p.createdAt).toLocaleDateString("es-EC"),
      formatearEstado(p.estado)
    ]);

    doc.autoTable({
      startY: 30,
      head: [["Cliente", "Total", "Fecha", "Estado"]],
      body: filas,
      theme: "grid"
    });

    doc.save("pedidos_kmezropa.pdf");
  } catch (err) {
    console.error("❌ Error al exportar PDF:", err);
    mostrarMensaje("❌ No se pudo generar el PDF", "error");
  }
}

/* 🔠 Formato de estado */
function formatearEstado(estado) {
  const est = (estado || "").toLowerCase();
  return {
    pendiente: "⏳ Pendiente",
    en_proceso: "⚙️ En Proceso",
    enviado: "📦 Enviado",
    cancelado: "❌ Cancelado",
    pagado: "💰 Pagado"
  }[est] || "🔘 Desconocido";
}

/* 🧩 Opciones para el <select> */
function generarOpcionesEstado(actual) {
  return ESTADOS_VALIDOS.map(e =>
    `<option value="${e}" ${e === actual ? "selected" : ""}>${formatearEstado(e)}</option>`
  ).join("");
}

/* 💬 Link WhatsApp */
function generarLinkWhatsapp(p) {
  const productos = Array.isArray(p.items)
    ? p.items.map(i => `• ${i.cantidad}x ${sanitize(i.name)} (${sanitize(i.talla || "Única")})`).join("\n")
    : "";

  const texto = encodeURIComponent(
    `Pedido de ${p.nombreCliente}\n\n${productos}\n\nTotal: $${p.total?.toFixed(2) || "0.00"}`
  );

  return `<a href="https://wa.me/593990270864?text=${texto}" target="_blank" class="btn btn-wsp mt-1">💬 WhatsApp</a>`;
}

/* 🔐 Sanitización segura */
function sanitize(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML.trim();
}

// 🌐 Global
window.goBack = goBack;
