"use strict";

import { API_BASE } from "./config.js";
import { verificarSesion, mostrarMensaje, goBack } from "./admin-utils.js";

let token = "";
const API = `${API_BASE}/api/categories`;

const formCrear = document.getElementById("formCrearCategoria");
const formSub = document.getElementById("formSubcategoria");
const categoriaInput = document.getElementById("categoriaInput");
const subcategoriaInput = document.getElementById("subcategoriaInput");
const selectCategoria = document.getElementById("selectCategoria");
const listaCategorias = document.getElementById("listaCategorias");

// 🔐 Sesión obligatoria
document.addEventListener("DOMContentLoaded", async () => {
  try {
    token = await verificarSesion();
    await cargarCategorias();
  } catch (err) {
    mostrarMensaje("❌ Error de sesión. Redirigiendo...", "error");
    setTimeout(() => window.location.href = "/login.html", 1500);
  }
});

// ➕ Crear categoría
formCrear?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = sanitize(categoriaInput.value.trim());
  if (!nombre) return mostrarMensaje("⚠️ Ingresa un nombre válido", "error");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: nombre })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "❌ No se pudo crear la categoría");

    mostrarMensaje("✅ Categoría creada", "success");
    formCrear.reset();
    categoriaInput.focus();
    await cargarCategorias();
  } catch (err) {
    mostrarMensaje(err.message, "error");
  }
});

// ➕ Crear subcategoría
formSub?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const categoriaId = selectCategoria.value;
  const sub = sanitize(subcategoriaInput.value.trim());

  if (!categoriaId || !sub) return mostrarMensaje("⚠️ Completa todos los campos", "error");

  try {
    const res = await fetch(`${API}/${categoriaId}/subcategories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ subcategory: sub })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "❌ Error al agregar subcategoría");

    mostrarMensaje("✅ Subcategoría agregada", "success");
    formSub.reset();
    subcategoriaInput.focus();
    await cargarCategorias();
  } catch (err) {
    mostrarMensaje(err.message, "error");
  }
});

// 🔄 Obtener categorías del backend
async function cargarCategorias() {
  try {
    const res = await fetch(API, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const categorias = data?.data;
    if (!Array.isArray(categorias)) throw new Error(data.message || "❌ Error al obtener categorías");

    renderCategorias(categorias);
    actualizarSelect(categorias);
  } catch (err) {
    mostrarMensaje(err.message, "error");
    listaCategorias.innerHTML = `<p class="text-error">${sanitize(err.message)}</p>`;
  }
}

// 📋 Render visual de categorías
function renderCategorias(categorias = []) {
  if (!categorias.length) {
    listaCategorias.innerHTML = "<p>📭 No hay categorías registradas.</p>";
    return;
  }

  listaCategorias.innerHTML = categorias.map(cat => `
    <li>
      <strong>${sanitize(cat.name)}</strong>
      <button class="btn-danger" onclick="eliminarCategoria('${cat._id}')">🗑️</button>
      <ul>
        ${
          Array.isArray(cat.subcategories) && cat.subcategories.length
            ? cat.subcategories.map(sub => `
              <li>
                ${sanitize(sub)}
                <button class="btn-danger" onclick="eliminarSubcategoria('${cat._id}', '${encodeURIComponent(sub)}')">🗑️</button>
              </li>
            `).join("")
            : "<li><em>Sin subcategorías</em></li>"
        }
      </ul>
    </li>
  `).join("");
}

// ⬇️ Actualizar <select> con categorías
function actualizarSelect(categorias = []) {
  selectCategoria.innerHTML = '<option value="">📂 Selecciona una categoría</option>';
  categorias.forEach(cat => {
    selectCategoria.innerHTML += `<option value="${cat._id}">${sanitize(cat.name)}</option>`;
  });
}

// ❌ Eliminar categoría
window.eliminarCategoria = async (id) => {
  if (!confirm("⚠️ ¿Eliminar esta categoría y todas sus subcategorías?")) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "❌ No se pudo eliminar la categoría");

    mostrarMensaje("✅ Categoría eliminada", "success");
    await cargarCategorias();
  } catch (err) {
    mostrarMensaje(err.message, "error");
  }
};

// ❌ Eliminar subcategoría
window.eliminarSubcategoria = async (categoryId, subcategory) => {
  if (!confirm("⚠️ ¿Eliminar esta subcategoría?")) return;

  try {
    const res = await fetch(`${API}/${categoryId}/subcategories/${subcategory}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "❌ No se pudo eliminar la subcategoría");

    mostrarMensaje("✅ Subcategoría eliminada", "success");
    await cargarCategorias();
  } catch (err) {
    mostrarMensaje(err.message, "error");
  }
};

// 🧼 Sanitizar texto
function sanitize(text = "") {
  const temp = document.createElement("div");
  temp.textContent = text;
  return temp.innerHTML.trim();
}

// 🔙 Global
window.goBack = goBack;
