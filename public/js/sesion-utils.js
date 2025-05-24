"use strict";

import { API_BASE } from "./config.js";

/**
 * 🔐 Obtiene el usuario autenticado usando la cookie de sesión.
 * Guarda localmente el usuario si está autenticado.
 * @returns {Promise<object|null>}
 */
export async function getUsuarioSesion() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok && data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("❌ Error al verificar sesión del usuario:", error);
    return null;
  }
}

/**
 * 🔐 Como `getUsuarioSesion` pero redirige si no hay sesión válida.
 * @returns {Promise<object|null>}
 */
export async function getUsuarioSesionSeguro() {
  const user = await getUsuarioSesion();

  if (!user) {
    mostrarMensaje("🔒 Debes iniciar sesión para continuar.", "error");
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 1000);
  }

  return user;
}

/**
 * 🚪 Cierra la sesión del cliente tanto del frontend como del backend.
 */
export async function cerrarSesionCliente() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      credentials: "include"
    });
  } catch (error) {
    console.warn("⚠️ Error al cerrar sesión (backend):", error.message);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();

    // ✅ Redirigir al login
    window.location.href = "/login.html";
  }
}

/**
 * 💬 Muestra un mensaje en pantalla (con fallback a alert si no hay div).
 * @param {string} texto - Texto del mensaje.
 * @param {"info" | "success" | "error" | "warn"} tipo - Tipo de mensaje.
 */
export function mostrarMensaje(texto = "", tipo = "info") {
  const box = document.getElementById("adminMensaje");

  if (!box) {
    alert(texto);
    return;
  }

  box.textContent = texto;
  box.setAttribute("role", "alert");
  box.setAttribute("aria-live", "assertive");
  box.className = `admin-message ${tipo}`;
  box.classList.remove("oculto");

  clearTimeout(box._timeout);
  box._timeout = setTimeout(() => {
    box.classList.add("oculto");
  }, 4000);
}
