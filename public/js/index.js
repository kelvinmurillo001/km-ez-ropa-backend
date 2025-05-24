"use strict";

import { registrarVisitaPublica } from "./utils.js";
import { API_BASE } from "./config.js";

// ▶️ Inicio
document.addEventListener("DOMContentLoaded", async () => {
  registrarVisitaPublica();
  mostrarSaludo();
  aplicarModoOscuro();
  await mostrarProductosDestacados();
  actualizarCarritoWidget();
});

/* ───────────────────────────────────────────── */
/* 🛍️ Mostrar productos destacados               */
/* ───────────────────────────────────────────── */
async function mostrarProductosDestacados(reintentos = 1) {
  const catalogo = document.getElementById("catalogo");
  if (!catalogo) return;

  catalogo.setAttribute("aria-busy", "true");
  catalogo.innerHTML = `<p class="text-center">⏳ Cargando productos...</p>`;

  try {
    const res = await fetch(`${API_BASE}/api/products?featured=true`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al cargar productos destacados.");

    const productos = Array.isArray(data.productos) ? data.productos : [];
    if (!productos.length) {
      catalogo.innerHTML = `<p class="text-center">😢 No hay productos destacados en este momento.</p>`;
      return;
    }

    catalogo.innerHTML = "";
    const itemsGA = [];

    productos.forEach((producto, index) => {
      const imagen = sanitize(producto.image || producto.images?.[0]?.url || "/assets/logo.jpg");
      const nombre = sanitize(producto.name || "Producto sin nombre");
      const precio = typeof producto.price === "number" ? `$${producto.price.toFixed(2)}` : "$ --";
      const id = encodeURIComponent(producto._id || "");

      if (id) {
        itemsGA.push({
          item_id: producto._id,
          item_name: producto.name,
          price: producto.price,
          index,
          item_category: producto.category || "",
          item_list_name: "Destacados"
        });
      }

      const card = document.createElement("div");
      card.className = "product-card fade-in";
      card.innerHTML = `
        <img src="${imagen}" alt="Imagen de ${nombre}" loading="lazy"
             onerror="this.onerror=null;this.src='/assets/logo.jpg'" />
        <div class="product-info">
          <h3>${nombre}</h3>
          <p>${precio}</p>
          ${id ? `<button class="btn-card" data-id="${id}" data-name="${nombre}" aria-label="Ver detalles de ${nombre}">👁️ Ver</button>` : ""}
        </div>
      `;
      catalogo.appendChild(card);
    });

    if (typeof gtag === "function" && itemsGA.length) {
      gtag("event", "view_item_list", {
        item_list_name: "Destacados",
        items: itemsGA
      });
    }

    catalogo.addEventListener("click", (e) => {
      if (e.target.matches(".btn-card")) {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;

        if (typeof gtag === "function") {
          gtag("event", "select_item", {
            item_list_name: "Destacados",
            items: [{ item_id: id, item_name: name }]
          });
        }

        verDetalle(id);
      }
    });

  } catch (error) {
    console.error("❌ Error mostrando productos destacados:", error);

    if (reintentos > 0) {
      setTimeout(() => mostrarProductosDestacados(reintentos - 1), 1500);
      return;
    }

    const mensaje = error.message?.includes("CSP")
      ? "⚠️ Bloqueado por políticas de seguridad del navegador (CSP)."
      : "⚠️ No se pudieron cargar los productos. Intenta más tarde.";

    catalogo.innerHTML = `<p class="text-center" style="color:red;">${sanitize(mensaje)}</p>`;
  } finally {
    catalogo.setAttribute("aria-busy", "false");
  }
}

/* ───────────────────────────────────────────── */
/* 🌞 Mostrar saludo dinámico                    */
/* ───────────────────────────────────────────── */
function mostrarSaludo() {
  const hora = new Date().getHours();
  let saludo = "👋 ¡Bienvenido a KM & EZ ROPA!";

  if (hora >= 5 && hora < 12) saludo = "🌞 ¡Buenos días! Tu estilo comienza temprano.";
  else if (hora >= 12 && hora < 18) saludo = "☀️ ¡Buenas tardes! Descubre lo más top de la temporada.";
  else saludo = "🌙 ¡Buenas noches! Ideal para elegir tu look de mañana.";

  console.log(saludo);
}

/* ───────────────────────────────────────────── */
/* 🌘 Activar/desactivar modo oscuro             */
/* ───────────────────────────────────────────── */
function aplicarModoOscuro() {
  const btn = document.getElementById("modoOscuroBtn");
  const dark = localStorage.getItem("modoOscuro") === "true";

  if (dark) document.body.classList.add("modo-oscuro");

  if (btn) {
    btn.textContent = dark ? "☀️" : "🌙";
    btn.setAttribute("aria-label", dark ? "Modo claro" : "Modo oscuro");
    btn.setAttribute("aria-pressed", String(dark));

    btn.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("modo-oscuro");
      localStorage.setItem("modoOscuro", isDark);
      btn.textContent = isDark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", isDark ? "Modo claro" : "Modo oscuro");
      btn.setAttribute("aria-pressed", String(isDark));
    });
  }
}

/* ───────────────────────────────────────────── */
/* 🔍 Ir al detalle del producto                 */
/* ───────────────────────────────────────────── */
function verDetalle(id) {
  if (!id || typeof id !== "string") return;
  window.location.href = `/detalle.html?id=${encodeURIComponent(id)}`;
}

/* ───────────────────────────────────────────── */
/* 🛒 Actualizar contador de carrito             */
/* ───────────────────────────────────────────── */
function actualizarCarritoWidget() {
  try {
    const carrito = JSON.parse(localStorage.getItem("km_ez_cart")) || [];
    const total = carrito.reduce((sum, i) => sum + (i.quantity || i.cantidad || 0), 0);
    const contador = document.getElementById("cartCount");
    if (contador) contador.textContent = total;
  } catch (err) {
    console.warn("⚠️ Error al actualizar el carrito:", err);
  }
}

/* ───────────────────────────────────────────── */
/* 🧼 Sanitizar entrada                          */
/* ───────────────────────────────────────────── */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.trim();
}
