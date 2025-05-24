"use strict";

import { STORAGE_KEYS } from "./config.js";
import {
  verificarSesion,
  cerrarSesion,
  getUsuarioActivo,
  mostrarMensaje
} from "./admin-utils.js";

// ▶️ Al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await verificarSesion(); // ✅ Validar sesión

    const user = getUsuarioActivo();
    mostrarSaludo(user?.name || user?.username || "Administrador");

    await cargarProductos();
    configurarLogout();
  } catch (err) {
    console.error("❌ Error de sesión:", err.message);
    mostrarMensaje("❌ Sesión inválida. Redirigiendo...", "error");
    setTimeout(() => (window.location.href = "/login.html"), 1500);
  }
});

/**
 * 👋 Mostrar saludo al admin
 */
function mostrarSaludo(nombre = "Administrador") {
  const saludo = document.getElementById("adminSaludo");
  if (saludo) {
    saludo.textContent = `👋 Bienvenido, ${sanitize(nombre)}`;
  }
}

/**
 * 📦 Cargar productos del backend
 */
async function cargarProductos() {
  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = `<p>⏳ Cargando productos...</p>`;

  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (!token || token.length < 10) {
    contenedor.innerHTML = `<p style="color:red;">❌ Token no válido. Inicia sesión nuevamente.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/products?limite=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (res.status === 401 || res.status === 403) {
      mostrarMensaje("⛔ Acceso no autorizado. Redirigiendo...", "error");
      setTimeout(() => (window.location.href = "/login.html"), 1500);
      return;
    }

    if (!res.ok || !Array.isArray(data.productos)) {
      throw new Error(data.message || "❌ Error al obtener productos.");
    }

    if (data.productos.length === 0) {
      contenedor.innerHTML = `<p>📭 No hay productos registrados aún.</p>`;
      return;
    }

    contenedor.innerHTML = "";
    data.productos.forEach((producto) => {
      contenedor.appendChild(crearTarjetaProducto(producto));
    });
  } catch (err) {
    console.error("❌ Error cargando productos:", err);
    contenedor.innerHTML = `<p style="color:red;">❌ ${sanitize(err.message)}</p>`;
  }
}

/**
 * 🧾 Crea una tarjeta visual de producto
 */
function crearTarjetaProducto(p) {
  const card = document.createElement("div");
  card.className = "producto-card";
  card.setAttribute("role", "region");
  card.setAttribute("aria-label", `Producto: ${p.name || "Sin nombre"}`);

  const precio = !isNaN(p.price) ? `$${parseFloat(p.price).toFixed(2)}` : "--";
  const categoria = p.category ? sanitize(p.category) : "Sin categoría";
  const destacado = p.featured ? "⭐ Destacado" : "Normal";

  card.innerHTML = `
    <h3>${sanitize(p.name || "Producto")}</h3>
    <p>💲 ${precio}</p>
    <p>📂 ${categoria}</p>
    <p>${destacado}</p>
  `;

  return card;
}

/**
 * 🚪 Configurar botón logout
 */
function configurarLogout() {
  const btn = document.getElementById("btnLogout") || document.getElementById("btnCerrarSesion");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
      cerrarSesion();
    }
  });
}

/**
 * 🧼 Prevención básica contra XSS
 */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML.trim();
}
