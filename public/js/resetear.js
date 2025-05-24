"use strict";

// 🌐 API base
const API_BASE = "https://api.kmezropacatalogo.com";

// 📌 Elementos del DOM
const form = document.getElementById("resetForm");
const msgEstado = document.getElementById("msgEstado");
const btnSubmit = form?.querySelector("button[type='submit']");

// ✅ Verificar elementos antes de continuar
if (form && msgEstado && btnSubmit) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🧼 Limpiar mensaje anterior
    mostrarMensaje("");

    const email = form.email.value.trim().toLowerCase();

    // 🔐 Validación básica de email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return mostrarMensaje("⚠️ Ingresa un correo electrónico válido.", "warn");
    }

    // ⏳ Estado visual
    mostrarMensaje("⏳ Enviando solicitud...", "info");
    btnSubmit.disabled = true;
    btnSubmit.textContent = "📤 Enviando...";

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "❌ Error inesperado al solicitar reseteo.");
      }

      mostrarMensaje(data.message || "✅ Revisa tu correo para continuar.", "success");
      form.reset();
    } catch (err) {
      console.error("❌ Error al enviar reset:", err);
      mostrarMensaje(`❌ ${err.message || "Error desconocido al enviar reset."}`, "error");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "📧 Solicitar Contraseña";
    }
  });
}

/**
 * 🔔 Mostrar mensaje visual y accesible
 * @param {string} texto 
 * @param {"success"|"error"|"warn"|"info"} tipo 
 */
function mostrarMensaje(texto, tipo = "info") {
  if (!msgEstado) return;

  msgEstado.textContent = texto;
  msgEstado.setAttribute("role", "alert");
  msgEstado.setAttribute("aria-live", "assertive");

  const colores = {
    success: "limegreen",
    error: "tomato",
    warn: "orange",
    info: "#555"
  };

  msgEstado.style.color = colores[tipo] || "#444";
}
