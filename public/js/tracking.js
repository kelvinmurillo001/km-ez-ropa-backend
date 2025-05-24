"use strict";

import { API_BASE } from "./config.js";

// 📌 Elementos del DOM
const codigoInput = document.getElementById("codigoSeguimiento");
const btnBuscar = document.getElementById("btnBuscar");
const barraProgreso = document.getElementById("barraProgreso");
const resumenPedido = document.getElementById("resumenPedido");
const mensajeEstado = document.getElementById("mensajeEstado");

const API_TRACK = `${API_BASE}/api/orders/track`;
let procesando = false;

// ▶️ Al cargar la página: precargar código si viene por URL
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const codigo = params.get("codigo");
  if (codigo) {
    codigoInput.value = codigo.trim().toUpperCase();
    buscarPedido(codigo.trim());
  }
});

// 🔍 Al presionar botón
btnBuscar?.addEventListener("click", () => {
  const codigo = codigoInput.value.trim().toUpperCase();
  if (!codigo || !/^[A-Z0-9\-]{3,30}$/.test(codigo)) {
    return mostrarMensaje("⚠️ Código inválido. Usa letras, números o guiones.", "warn");
  }
  if (!procesando) buscarPedido(codigo);
});

/**
 * 🔍 Realiza la consulta del pedido por código
 * @param {string} codigo
 */
async function buscarPedido(codigo) {
  procesando = true;
  mostrarMensaje("⏳ Buscando pedido...", "info");
  barraProgreso.hidden = true;
  resumenPedido.hidden = true;

  try {
    const res = await fetch(`${API_TRACK}/${encodeURIComponent(codigo)}`);
    const data = await res.json();

    if (!res.ok || !data?.estadoActual) {
      throw new Error(data?.message || "❌ Pedido no encontrado.");
    }

    mostrarProgreso(data.estadoActual);
    mostrarResumen(data);
    mostrarMensaje("✅ Pedido encontrado.", "success");
  } catch (err) {
    console.error("❌ Error al buscar pedido:", err);
    mostrarMensaje(err.message || "❌ Error inesperado.", "error");
  } finally {
    procesando = false;
  }
}

/**
 * 📈 Activa visualmente los pasos del progreso
 * @param {string} estado
 */
function mostrarProgreso(estado = "") {
  barraProgreso.hidden = false;
  document.querySelectorAll(".paso").forEach(p => p.classList.remove("active"));

  const pasos = {
    pendiente: ["paso-recibido"],
    recibido: ["paso-recibido"],
    preparando: ["paso-recibido", "paso-preparando"],
    "en proceso": ["paso-recibido", "paso-preparando"],
    enviado: ["paso-recibido", "paso-preparando", "paso-en-camino"],
    "en camino": ["paso-recibido", "paso-preparando", "paso-en-camino"],
    entregado: ["paso-recibido", "paso-preparando", "paso-en-camino", "paso-entregado"],
    cancelado: ["paso-recibido"]
  };

  const activos = pasos[estado.toLowerCase()] || ["paso-recibido"];
  activos.forEach(id => {
    document.getElementById(id)?.classList.add("active");
  });
}

/**
 * 🧾 Muestra los datos del pedido
 * @param {object} resumen
 */
function mostrarResumen(resumen = {}) {
  resumenPedido.hidden = false;
  document.getElementById("nombreCliente").textContent = sanitize(resumen.nombre || "-");
  document.getElementById("direccionCliente").textContent = sanitize(resumen.direccion || "-");
  document.getElementById("metodoPago").textContent = sanitize(resumen.metodoPago || "-");
  document.getElementById("totalPedido").textContent = `$${parseFloat(resumen.total || 0).toFixed(2)}`;
}

/**
 * 💬 Muestra un mensaje accesible
 * @param {string} texto
 * @param {'success' | 'error' | 'warn' | 'info'} tipo
 */
function mostrarMensaje(texto, tipo = "info") {
  mensajeEstado.textContent = texto;
  mensajeEstado.style.color = {
    success: "limegreen",
    error: "tomato",
    warn: "orange",
    info: "#666"
  }[tipo] || "#666";
  mensajeEstado.setAttribute("role", "alert");
  mensajeEstado.setAttribute("aria-live", "assertive");
}

/**
 * 🧼 Sanitiza texto para evitar XSS
 * @param {string} text
 * @returns {string}
 */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
