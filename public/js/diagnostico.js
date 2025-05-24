"use strict";

import { API_BASE } from "./config.js";

// 📌 Referencias DOM
const btn = document.getElementById("btnDiagnostico");
const contenedor = document.getElementById("resultados");

// 🔐 Token de administrador
const token = localStorage.getItem("admin_token");

// 🧪 Pruebas del sistema
const tests = [
  {
    nombre: "🟢 Backend API /status",
    url: `${API_BASE}/api/status`,
    validar: (res) => res.status === "ok",
  },
  {
    nombre: "🧠 Estado de MongoDB /health",
    url: `${API_BASE}/health`,
    validar: (res) => res.db?.includes("OK"),
  },
  {
    nombre: "📦 Productos desde /api/products",
    url: `${API_BASE}/api/products`,
    validar: (res) => Array.isArray(res.productos),
  },
  {
    nombre: "📊 Estadísticas /api/stats/resumen",
    url: `${API_BASE}/api/stats/resumen`,
    requiereToken: true,
    validar: (res) => typeof res.totalProductos !== "undefined",
  },
  {
    nombre: "🔐 Autenticación protegida /api/orders",
    url: `${API_BASE}/api/orders`,
    requiereToken: true,
    validar: (res) => Array.isArray(res.data),
  },
  {
    nombre: "💳 PayPal (create-order)",
    url: `${API_BASE}/api/paypal/create-order`,
    method: "POST",
    body: JSON.stringify({ total: 1.99 }),
    headers: { "Content-Type": "application/json" },
    validar: (res) => !!res?.data?.id,
  },
];

/**
 * 🧪 Ejecuta una prueba individual y actualiza el DOM con su resultado.
 * @param {Object} test - Objeto de prueba.
 */
async function ejecutarPrueba(test) {
  const div = document.createElement("div");
  div.className = "resultado loading";
  div.setAttribute("role", "status");
  div.textContent = `⏳ Ejecutando: ${test.nombre}`;
  contenedor.appendChild(div);

  try {
    const headers = { ...(test.headers || {}) };

    if (test.requiereToken) {
      if (!token) throw new Error("🔑 Token no disponible");
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(test.url, {
      method: test.method || "GET",
      headers,
      body: test.body || null,
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok && test.validar(data)) {
      div.className = "resultado ok";
      div.textContent = `✅ ${test.nombre} - OK`;
    } else {
      const msg = data.message || `Error HTTP ${res.status}`;
      div.className = "resultado fail";
      div.textContent = `❌ ${test.nombre} - ${msg}`;
    }
  } catch (err) {
    div.className = "resultado fail";
    div.textContent = `❌ ${test.nombre} - ${err.message}`;
  }
}

// ▶️ Ejecutar todas las pruebas al hacer clic
btn?.addEventListener("click", async () => {
  contenedor.innerHTML = "";

  for (const test of tests) {
    await ejecutarPrueba(test);
  }
});
