"use strict";

import { API_BASE } from "./config.js";

const API_PROMOS = `${API_BASE}/api/promos`;

document.addEventListener("DOMContentLoaded", () => {
  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    console.warn("⚠️ Recomendación: utiliza HTTPS en producción.");
  }

  cargarPromociones();
});

/* 🔄 Cargar promociones activas */
async function cargarPromociones() {
  try {
    const res = await fetch(API_PROMOS, {
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!res.ok) throw new Error("Error al obtener promociones");

    const { data: promos = [] } = await res.json();
    if (!Array.isArray(promos) || promos.length === 0) return;

    const clavePagina = detectarClavePagina(location.pathname);
    const ahora = Date.now();

    const activas = promos.filter(p =>
      p.active &&
      Array.isArray(p.pages) &&
      p.pages.includes(clavePagina) &&
      (!p.startDate || new Date(p.startDate).getTime() <= ahora) &&
      (!p.endDate || new Date(p.endDate).getTime() >= ahora)
    );

    const agrupadas = agruparPorPosicion(activas);
    Object.entries(agrupadas).forEach(([posicion, grupo]) => {
      renderRotadorPromos(grupo, posicion);
    });

  } catch (err) {
    console.error("❌ Promociones no disponibles:", err);
    mostrarFallback();
  }
}

/* 🔍 Detectar página */
function detectarClavePagina(path) {
  if (path.includes("checkout")) return "checkout";
  if (path.includes("carrito")) return "carrito";
  if (path.includes("categorias")) return "categorias";
  if (path.includes("productos")) return "productos";
  if (path.includes("detalle")) return "detalle";
  if (path === "/" || path.includes("index")) return "home";
  return "otros";
}

/* 🧠 Agrupar promociones por posición */
function agruparPorPosicion(lista = []) {
  return lista.reduce((acc, promo) => {
    const pos = promo.position || "top";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(promo);
    return acc;
  }, {});
}

/* 🎞️ Renderizar slider de promociones */
function renderRotadorPromos(promos = [], posicion = "top") {
  if (!promos.length) return;

  const wrapper = document.createElement("section");
  wrapper.className = `promo-display promo-${promos[0].theme || "blue"} promo-${posicion}`;
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-label", `Promociones en posición ${posicion}`);
  wrapper.style.position = "relative";
  wrapper.style.overflow = "hidden";

  const slider = document.createElement("div");
  slider.className = "promo-slider";
  slider.style.whiteSpace = "nowrap";
  slider.style.transition = "transform 0.5s ease-in-out";

  promos.forEach((promo, index) => {
    const slide = document.createElement("div");
    slide.className = "promo-slide";
    slide.setAttribute("aria-hidden", index > 0 ? "true" : "false");
    slide.style.display = "inline-block";
    slide.style.width = "100%";

    const mensaje = sanitize(promo.message || "");
    let contenido = `<p class="promo-msg">📣 ${mensaje}</p>`;

    if (promo.mediaType === "image" && promo.mediaUrl) {
      contenido += `<img src="${promo.mediaUrl}" alt="Imagen promocional" class="promo-img" loading="lazy" onerror="this.style.display='none'" />`;
    }

    if (promo.mediaType === "video" && promo.mediaUrl) {
      contenido += `
        <video controls class="promo-video" preload="metadata" aria-label="Video promocional">
          <source src="${promo.mediaUrl}" type="video/mp4" />
          Tu navegador no soporta video.
        </video>`;
    }

    slide.innerHTML = contenido;
    slider.appendChild(slide);
  });

  wrapper.appendChild(slider);
  insertarPorPosicion(wrapper, posicion);

  if (promos.length > 1) {
    iniciarRotador(slider, promos.length);
  }
}

/* 🎯 Insertar en el layout */
function insertarPorPosicion(elemento, posicion) {
  const main = document.querySelector("main");
  const body = document.body;

  switch (posicion) {
    case "top": main?.prepend(elemento) || body.prepend(elemento); break;
    case "bottom": main?.appendChild(elemento) || body.appendChild(elemento); break;
    case "middle":
      main?.firstChild
        ? main.insertBefore(elemento, main.firstChild)
        : (main?.appendChild(elemento) || body.appendChild(elemento));
      break;
    default: body.appendChild(elemento);
  }
}

/* ⏩ Activar rotador automático */
function iniciarRotador(slider, totalSlides) {
  let index = 0;
  setInterval(() => {
    index = (index + 1) % totalSlides;
    slider.style.transform = `translateX(-${index * 100}%)`;

    [...slider.children].forEach((slide, i) =>
      slide.setAttribute("aria-hidden", i !== index)
    );
  }, 6000);
}

/* 🧼 Sanitizar texto */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ⚠️ Mostrar fallback */
function mostrarFallback() {
  const main = document.querySelector("main") || document.body;
  const fallback = document.createElement("div");
  fallback.className = "promo-banner";
  fallback.style.backgroundColor = "#fff3cd";
  fallback.style.color = "#856404";
  fallback.innerHTML = `<p style="text-align:center;">⚠️ No se pudo cargar promociones activas.</p>`;
  main.prepend(fallback);
}
