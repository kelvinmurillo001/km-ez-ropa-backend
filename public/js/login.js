"use strict";

// 📦 Configuración base
import { STORAGE_KEYS, GOOGLE_LOGIN_URL } from "./config.js";

// 🧼 Sanitizar entradas para evitar XSS
const sanitize = (str = "") =>
  str.replace(/[<>"'`;(){}[\]]/g, "").trim();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const btnSubmit = form?.querySelector("button[type='submit']");
  const inputUser = form?.username;
  const inputPass = form?.password;
  const googleBtn = document.getElementById("googleLoginBtn");

  // 🌙 Modo oscuro desde almacenamiento
  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }

  if (!form || !btnSubmit || !inputUser || !inputPass) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userInput = sanitize(inputUser.value.trim());
    const password = sanitize(inputPass.value.trim());

    if (!userInput || !password) {
      mostrarMensaje("⚠️ Ingresa tu usuario o correo y contraseña.", "error");
      inputUser.focus();
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "🔄 Verificando...";

    const esCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInput);
    const endpoint = esCorreo
      ? `/auth/login-cliente`
      : `/api/auth/login`;

    const payload = esCorreo
      ? { email: userInput.toLowerCase(), password }
      : { username: userInput.toLowerCase(), password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok || !result?.data?.user || !result?.data?.accessToken) {
        const mensajes = {
          400: "⚠️ Datos inválidos enviados.",
          401: "🔐 Usuario o contraseña incorrectos.",
          403: "⛔ Acceso denegado."
        };

        const errorMsg = mensajes[res.status] || result.message || "❌ Error inesperado al iniciar sesión.";
        mostrarMensaje(errorMsg, "error");
        return;
      }

      localStorage.setItem(STORAGE_KEYS.token, result.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(result.data.user));

      mostrarMensaje("✅ Acceso concedido. Redirigiendo...", "success");

      setTimeout(() => {
        const destino = result.data.user.role === "admin" ? "/panel.html" : "/cliente.html";
        window.location.assign(destino);
      }, 1000);

    } catch (err) {
      console.error("❌ Error de red:", err);
      mostrarMensaje("❌ No se pudo conectar con el servidor.", "error");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "🔓 Ingresar";
    }
  });

  form.querySelectorAll("input").forEach(input => {
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
      }
    });
  });

  googleBtn?.addEventListener("click", () => {
    window.location.href = GOOGLE_LOGIN_URL;
  });
});

function mostrarMensaje(texto, tipo = "info") {
  const box = document.getElementById("adminMensaje");
  if (!box) return alert(texto);

  box.textContent = texto;
  box.setAttribute("role", "alert");
  box.setAttribute("aria-live", "assertive");
  box.className = `admin-message ${tipo}`;
  box.classList.remove("oculto");

  clearTimeout(box._timeout);
  box._timeout = setTimeout(() => {
    box.classList.add("oculto");
  }, 4500);
}
