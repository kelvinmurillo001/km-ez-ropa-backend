"use strict";

import { verificarSesion, goBack, mostrarMensaje } from "./admin-utils.js";
import { API_BASE } from "./config.js";

const API_PROMOS = `${API_BASE}/api/promos`;
const API_UPLOAD = `${API_BASE}/api/uploads`;

const formPromo = document.getElementById("formPromo");
const msgPromo = document.getElementById("msgPromo");
const estadoActual = document.getElementById("estadoActual");
const contenedorListaPromos = document.getElementById("promo-container");

let promocionId = null;
let token = "";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    token = await verificarSesion();

    if (!token) throw new Error("Sesión no válida");

    cargarPromocion();
    cargarTodasPromociones();

    formPromo?.addEventListener("submit", guardarPromocion);
    document.getElementById("promoTipo")?.addEventListener("change", mostrarCampoMultimedia);
  } catch (err) {
    mostrarError("❌ Error al cargar la sesión de administrador.");
    console.error(err);
  }
});

function mostrarCampoMultimedia() {
  const tipo = document.getElementById("promoTipo")?.value;
  const container = document.getElementById("mediaUploadContainer");
  container.innerHTML = "";

  if (tipo === "imagen") {
    container.innerHTML = `
      <label for="promoImagen">Seleccionar imagen:</label>
      <input type="file" id="promoImagen" accept="image/*" />
    `;
  } else if (tipo === "video") {
    container.innerHTML = `
      <label for="promoVideo">URL de video:</label>
      <input type="url" id="promoVideo" placeholder="https://..." />
    `;
  }
}

async function cargarPromocion() {
  try {
    const res = await fetch(API_PROMOS);
    const data = await res.json();
    const promo = Array.isArray(data.data) ? data.data[0] : null;

    if (!promo) {
      estadoActual.innerHTML = "<p>📭 No hay promociones activas.</p>";
      return;
    }

    promocionId = promo._id;
    renderPromocionActual(promo);
    cargarFormularioDesdePromocion(promo);
  } catch (err) {
    mostrarError("❌ Error al cargar promoción actual.");
    console.error(err);
  }
}

function renderPromocionActual(p) {
  const inicio = p.startDate ? new Date(p.startDate).toLocaleDateString() : "Sin inicio";
  const fin = p.endDate ? new Date(p.endDate).toLocaleDateString() : "Sin fin";
  const estado = p.active ? "✅ Activa" : "⛔ Inactiva";

  estadoActual.innerHTML = `
    <div class="promo-actual">
      <p><strong>Estado:</strong> ${estado}</p>
      <p><strong>Mensaje:</strong> ${sanitize(p.message)}</p>
      <p><strong>Vigencia:</strong> ${inicio} - ${fin}</p>
      <p><strong>Tema:</strong> ${p.theme}</p>
      <p><strong>Páginas:</strong> ${p.pages?.join(", ") || "Ninguna"}</p>
      <p><strong>Posición:</strong> ${p.position}</p>
      <p><strong>Tipo:</strong> ${p.mediaType ?? "texto"}</p>
      ${generarPreviewMedia(p)}
    </div>
  `;
}

function generarPreviewMedia(p) {
  if (!p.mediaUrl) return "";
  if (p.mediaType === "image") {
    return `<img src="${p.mediaUrl}" alt="Imagen promo" class="img-preview" />`;
  }
  if (p.mediaType === "video") {
    return `
      <video controls class="video-preview">
        <source src="${p.mediaUrl}" type="video/mp4" />
      </video>`;
  }
  return "";
}

function cargarFormularioDesdePromocion(p) {
  formPromo.promoMensaje.value = p.message || "";
  formPromo.promoActivo.checked = !!p.active;
  formPromo.promoTema.value = p.theme || "blue";
  formPromo.promoInicio.value = p.startDate?.slice(0, 10) || "";
  formPromo.promoFin.value = p.endDate?.slice(0, 10) || "";
  formPromo.promoTipo.value = p.mediaType || "texto";
  formPromo.promoPosition.value = p.position || "top";

  mostrarCampoMultimedia();
  if (p.mediaType === "video") {
    document.getElementById("promoVideo").value = p.mediaUrl;
  }

  document.querySelectorAll("input[name='promoPages']").forEach(cb => cb.checked = false);
  p.pages?.forEach(page => {
    const cb = document.querySelector(`input[name='promoPages'][value="${page}"]`);
    if (cb) cb.checked = true;
  });
}

async function guardarPromocion(e) {
  e.preventDefault();
  msgPromo.textContent = "";
  const btn = formPromo.querySelector("button[type='submit']");
  btn.disabled = true;

  try {
    const payload = await construirPayload();
    if (!payload) throw new Error("❌ Error al validar los datos del formulario.");

    msgPromo.textContent = "⏳ Guardando...";
    msgPromo.style.color = "#888";

    const res = await fetch(API_PROMOS, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    msgPromo.textContent = "✅ Promoción actualizada.";
    msgPromo.style.color = "limegreen";
    await cargarPromocion();
    await cargarTodasPromociones();
  } catch (err) {
    mostrarError(err.message || "❌ Error inesperado al guardar.");
    console.error(err);
  } finally {
    btn.disabled = false;
  }
}

async function construirPayload() {
  const mensaje = sanitize(formPromo.promoMensaje.value.trim());
  const tipo = formPromo.promoTipo.value;
  const activo = formPromo.promoActivo.checked;
  const inicio = formPromo.promoInicio.value || null;
  const fin = formPromo.promoFin.value || null;
  const tema = formPromo.promoTema.value;
  const posicion = formPromo.promoPosition.value;
  const paginas = Array.from(document.querySelectorAll("input[name='promoPages']:checked")).map(cb => cb.value);

  if (!mensaje || mensaje.length < 3) return mostrarError("⚠️ El mensaje es obligatorio.");
  if (!tipo || !paginas.length) return mostrarError("⚠️ Selecciona tipo de contenido y al menos una página.");
  if (inicio && fin && new Date(inicio) > new Date(fin)) return mostrarError("⚠️ Fechas inválidas.");

  const payload = {
    message: mensaje,
    active: activo,
    theme: tema,
    startDate: inicio,
    endDate: fin,
    position: posicion,
    pages: paginas
  };

  if (tipo === "video") {
    const url = sanitize(document.getElementById("promoVideo")?.value?.trim() || "");
    if (!/^https?:\/\/.+/.test(url)) return mostrarError("⚠️ URL de video inválida.");
    payload.mediaType = "video";
    payload.mediaUrl = url;
  }

  if (tipo === "imagen") {
    const file = document.getElementById("promoImagen")?.files?.[0];
    if (!file) return mostrarError("⚠️ Selecciona una imagen.");
    if (!file.type.startsWith("image/")) return mostrarError("⚠️ El archivo no es una imagen.");
    if (file.size > 2 * 1024 * 1024) return mostrarError("⚠️ Imagen muy grande (máx. 2MB)");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(API_UPLOAD, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al subir imagen.");

    payload.mediaType = "image";
    payload.mediaUrl = data.url || data.secure_url;
  }

  return payload;
}

async function cargarTodasPromociones() {
  try {
    const res = await fetch(`${API_PROMOS}/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);
    if (!Array.isArray(data.data)) return;

    contenedorListaPromos.innerHTML = data.data.length
      ? data.data.map(promoItemHTML).join("")
      : "<p>📭 No hay promociones registradas.</p>";
  } catch (err) {
    contenedorListaPromos.innerHTML = "<p style='color:red;'>❌ No se pudieron cargar promociones.</p>";
  }
}

function promoItemHTML(p) {
  const estado = p.active ? "✅ Activa" : "⛔ Inactiva";
  const inicio = p.startDate ? new Date(p.startDate).toLocaleDateString() : "Sin inicio";
  const fin = p.endDate ? new Date(p.endDate).toLocaleDateString() : "Sin fin";

  return `
    <div class="promo-item">
      <p><strong>${sanitize(p.message)}</strong></p>
      <p>${estado} | ${p.mediaType || "Texto"} | ${inicio} → ${fin}</p>
      <div class="promo-acciones">
        <button onclick="editarPromo('${p._id}')">✏️ Editar</button>
        <button onclick="alternarEstadoPromo('${p._id}')">🔁 Estado</button>
        <button onclick="eliminarPromo('${p._id}')">🗑️ Eliminar</button>
      </div>
    </div>
  `;
}

window.editarPromo = async (id) => {
  try {
    const res = await fetch(`${API_PROMOS}/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const promo = data.data.find(p => p._id === id);
    if (!promo) return mostrarError("❌ Promoción no encontrada");
    cargarFormularioDesdePromocion(promo);
    scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    mostrarError("❌ No se pudo cargar promoción para edición.");
  }
};

window.alternarEstadoPromo = async (id) => {
  try {
    const res = await fetch(`${API_PROMOS}/${id}/estado`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    mostrarMensaje("✅ Estado actualizado.", "success");
    await cargarTodasPromociones();
    await cargarPromocion();
  } catch {
    mostrarError("❌ No se pudo actualizar el estado.");
  }
};

window.eliminarPromo = async (id) => {
  if (!confirm("¿Eliminar esta promoción?")) return;

  try {
    const res = await fetch(`${API_PROMOS}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    mostrarMensaje("🗑️ Promoción eliminada", "success");
    await cargarTodasPromociones();
    await cargarPromocion();
  } catch {
    mostrarError("❌ Error al eliminar promoción");
  }
};

/* 🧼 Utilidad */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.trim();
}

function mostrarError(msg) {
  msgPromo.textContent = msg;
  msgPromo.style.color = "tomato";
  return null;
}

window.goBack = goBack;
