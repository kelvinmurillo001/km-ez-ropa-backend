"use strict";

import { API_BASE } from "./config.js";

let yaProcesado = false;

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!validarToken(token)) {
    mostrarMensaje("❌ Token inválido o modificado. Si realizaste el pago, contáctanos para asistencia.", "error");
    return;
  }

  if (yaProcesado) return;
  yaProcesado = true;

  try {
    mostrarMensaje("⏳ Confirmando tu pago con PayPal...", "info");

    const res = await fetch(`${API_BASE}/api/paypal/capture-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token })
    });

    const data = await res.json();

    if (res.ok && data?.data?.status?.toUpperCase() === "COMPLETED") {
      console.log("✅ Pago capturado:", data.data);
      mostrarMensaje("✅ ¡Pago confirmado exitosamente! 🎉 Gracias por tu compra.", "success");
      limpiarCarrito();
    } else {
      const msg = data?.message || "❌ No pudimos confirmar tu pago. Si ya fue debitado, contáctanos.";
      console.warn("⚠️ Error al confirmar:", data);
      mostrarMensaje(msg, "error");
    }

  } catch (err) {
    console.error("❌ Error inesperado:", err);
    mostrarMensaje("❌ Error interno al verificar el pago. Intenta más tarde o contacta soporte.", "error");
  }
});

/**
 * ✅ Verifica que el token tenga un formato válido
 */
function validarToken(token) {
  return typeof token === "string" &&
         token.length >= 10 &&
         /^[\w\-]+$/.test(token);
}

/**
 * 💬 Muestra un mensaje en pantalla con estilo accesible
 */
function mostrarMensaje(texto, tipo = "info") {
  const msgEstado = document.getElementById("msgEstado");
  if (!msgEstado) return;

  msgEstado.textContent = texto;
  msgEstado.style.color = {
    success: "limegreen",
    error: "tomato",
    warn: "orange",
    info: "#555"
  }[tipo] || "#555";

  msgEstado.setAttribute("role", "alert");
  msgEstado.setAttribute("aria-live", "assertive");

  msgEstado.classList.remove("fade-in");
  void msgEstado.offsetWidth;
  msgEstado.classList.add("fade-in");

  const timeout = tipo === "error" ? 8000 : 5000;
  setTimeout(() => msgEstado.classList.remove("fade-in"), timeout);
}

/**
 * 🧹 Limpia el carrito y pedido local tras confirmación
 */
function limpiarCarrito() {
  ["km_ez_cart", "km_ez_last_order", "codigoSeguimiento"].forEach(clave =>
    localStorage.removeItem(clave)
  );
}
