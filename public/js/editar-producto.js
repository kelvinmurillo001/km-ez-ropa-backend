"use strict";

import { verificarSesion, goBack, mostrarMensaje } from "./admin-utils.js";
import { API_BASE } from "./config.js";

let token = "";
let categorias = [];

const productId = new URLSearchParams(window.location.search).get("id");
if (!productId) {
  alert("❌ ID de producto no válido.");
  goBack();
}

const API_UPLOAD = `${API_BASE}/api/uploads`;
const API_PRODUCTO = `${API_BASE}/api/products/${productId}`;
const API_CATEGORIAS = `${API_BASE}/api/categories`;

const form = document.getElementById("formEditarProducto");
const msgEstado = document.getElementById("msgEstado");
const variantesDiv = document.getElementById("variantesExistentes");
const subcategoriaInput = document.getElementById("subcategoriaInput");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    token = await verificarSesion();

    if (localStorage.getItem("modoOscuro") === "true") {
      document.body.classList.add("modo-oscuro");
    }

    await cargarCategorias();
    await cargarProducto();

    document.getElementById("btnAgregarVariante")?.addEventListener("click", renderVarianteNueva);
  } catch (err) {
    mostrarMensaje("❌ Sesión inválida o error al iniciar", "error");
    setTimeout(() => goBack(), 1500);
  }
});

const limpiarTexto = (txt) => (txt || "").trim();

async function subirImagen(file) {
  if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
    throw new Error("⚠️ Imagen inválida o muy pesada");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(API_UPLOAD, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    credentials: "include"
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error subiendo imagen");

  return { url: data.url || data.secure_url, cloudinaryId: data.public_id };
}

async function cargarCategorias() {
  try {
    const res = await fetch(API_CATEGORIAS);
    const result = await res.json();
    const data = result.data || result;

    if (!Array.isArray(data)) throw new Error();

    categorias = data;
    const categoriaSelect = form.categoriaInput;
    categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';

    data.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.textContent = cat.name;
      categoriaSelect.appendChild(opt);
    });

    categoriaSelect.addEventListener("change", () => {
      const seleccionada = categoriaSelect.value;
      const categoriaObj = categorias.find((c) => c.name === seleccionada);
      if (categoriaObj?.subcategories?.length) {
        subcategoriaInput.innerHTML =
          `<option value="">Selecciona subcategoría</option>` +
          categoriaObj.subcategories.map((sub) => `<option value="${sub}">${sub}</option>`).join("");
        subcategoriaInput.disabled = false;
      } else {
        subcategoriaInput.innerHTML = `<option value="">Sin subcategorías</option>`;
        subcategoriaInput.disabled = true;
      }
    });
  } catch (err) {
    console.error("❌ Categorías error:", err);
    mostrarMensaje("❌ No se pudieron cargar las categorías", "error");
  }
}

async function cargarProducto() {
  try {
    const res = await fetch(API_PRODUCTO);
    const { producto } = await res.json();

    if (!res.ok || !producto || producto._id !== productId) {
      throw new Error("Producto no encontrado");
    }

    form.nombreInput.value = producto.name || "";
    form.descripcionInput.value = producto.description || "";
    form.precioInput.value = producto.price || "";
    form.stockInput.value = producto.stock ?? 0;
    form.categoriaInput.value = producto.category || "";
    form.colorInput.value = producto.color || "";
    form.tallasInput.value = producto.sizes?.join(", ") || "";
    form.destacadoInput.checked = !!producto.featured;
    form.activoInput.checked = !!producto.isActive;
    form.tallaTipoInput.value = producto.tallaTipo || "";
    form.borradorInput.checked = !producto.isActive;

    form.categoriaInput.dispatchEvent(new Event("change"));
    form.subcategoriaInput.value = producto.subcategory || "";

    if (producto.images?.length > 0) {
      document.getElementById("imagenPrincipalActual").innerHTML = `
        <img src="${producto.images[0].url}" alt="Imagen actual" class="imagen-preview-principal" />
      `;
    }

    producto.variants?.forEach(renderVarianteExistente);
  } catch (err) {
    console.error("❌ Producto error:", err);
    msgEstado.innerHTML = `❌ Error al cargar producto.<br><button onclick="goBack()">🔙 Volver</button>`;
  }
}

function renderVarianteExistente(v, i) {
  const div = document.createElement("div");
  div.className = "variante-box";
  div.innerHTML = `
    <p><strong>Variante #${i + 1}</strong></p>
    <img src="${v.imageUrl}" alt="Variante" class="preview-mini" />
    <label>Reemplazar imagen:</label>
    <input type="file" class="variante-img" accept="image/*" />
    <label>Color:</label>
    <input type="text" class="variante-color" value="${v.color}" />
    <label>Talla:</label>
    <input type="text" class="variante-talla" value="${v.talla}" />
    <label>Stock:</label>
    <input type="number" class="variante-stock" min="0" value="${v.stock}" />
    <label>Activo:</label>
    <input type="checkbox" class="variante-activo" ${v.active !== false ? 'checked' : ''} />
    <input type="hidden" class="variante-id" value="${v.cloudinaryId}" />
    <button type="button" class="btn-secundario btn-quitar-variante">🗑️ Quitar</button>
    <hr />
  `;
  variantesDiv.appendChild(div);
  div.querySelector(".btn-quitar-variante").addEventListener("click", () => div.remove());
}

function renderVarianteNueva() {
  const actual = document.querySelectorAll(".variante-box").length;
  if (actual >= 4) {
    mostrarMensaje("⚠️ Máximo 4 variantes permitidas", "warning");
    return;
  }

  const div = document.createElement("div");
  div.className = "variante-box";
  div.innerHTML = `
    <p><strong>Nueva Variante</strong></p>
    <label>Imagen:</label>
    <input type="file" class="variante-img" accept="image/*" required />
    <label>Color:</label>
    <input type="text" class="variante-color" required />
    <label>Talla:</label>
    <input type="text" class="variante-talla" required />
    <label>Stock:</label>
    <input type="number" class="variante-stock" min="0" required />
    <label>Activo:</label>
    <input type="checkbox" class="variante-activo" checked />
    <button type="button" class="btn-secundario btn-quitar-variante">🗑️ Quitar</button>
    <hr />
  `;
  variantesDiv.appendChild(div);
  div.querySelector(".btn-quitar-variante").addEventListener("click", () => div.remove());
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  form.classList.add("bloqueado");
  mostrarMensaje("⏳ Guardando cambios...", "info");

  try {
    const nombre = limpiarTexto(form.nombreInput.value);
    const descripcion = limpiarTexto(form.descripcionInput.value);
    const precio = parseFloat(form.precioInput.value);
    const stockBase = parseInt(form.stockInput.value || "0");
    const categoria = limpiarTexto(form.categoriaInput.value);
    const subcategoria = limpiarTexto(form.subcategoriaInput?.value);
    const destacado = form.destacadoInput?.checked || false;
    const borrador = form.borradorInput?.checked || false;
    const activo = !borrador;
    const tallaTipo = limpiarTexto(form.tallaTipoInput.value);
    const color = limpiarTexto(form.colorInput.value);
    const sizes = form.tallasInput.value.split(",").map(s => s.trim()).filter(Boolean);

    if (!nombre || !descripcion || !categoria || !tallaTipo || isNaN(precio)) {
      throw new Error("⚠️ Todos los campos obligatorios deben ser completados");
    }

    const nuevaImg = form.imagenPrincipalNueva?.files?.[0];
    const nuevaImagen = nuevaImg ? await subirImagen(nuevaImg) : null;

    const variantes = await Promise.all(Array.from(document.querySelectorAll(".variante-box")).map(async (b) => {
      const file = b.querySelector(".variante-img")?.files[0];
      const color = limpiarTexto(b.querySelector(".variante-color")?.value);
      const talla = limpiarTexto(b.querySelector(".variante-talla")?.value);
      const stock = parseInt(b.querySelector(".variante-stock")?.value || "0");
      const cloudinaryId = b.querySelector(".variante-id")?.value;
      const active = b.querySelector(".variante-activo")?.checked ?? true;

      if (!color || !talla || isNaN(stock)) throw new Error("⚠️ Variante incompleta");

      let imageUrl = b.querySelector("img")?.src;
      let finalCloudinaryId = cloudinaryId;

      if (file) {
        const subida = await subirImagen(file);
        imageUrl = subida.url;
        finalCloudinaryId = subida.cloudinaryId;
      }

      return { imageUrl, cloudinaryId: finalCloudinaryId, color, talla, stock, active };
    }));

    const claves = new Set();
    for (const v of variantes) {
      const clave = `${v.talla.toLowerCase()}-${v.color.toLowerCase()}`;
      if (claves.has(clave)) throw new Error("⚠️ Variantes duplicadas (talla + color)");
      claves.add(clave);
    }

    const payload = {
      name: nombre,
      description: descripcion,
      price: precio,
      category: categoria,
      subcategory,
      tallaTipo,
      color,
      sizes,
      featured: destacado,
      isActive: activo,
      variants
    };

    if (nuevaImagen) payload.images = [nuevaImagen];
    if (variantes.length === 0) payload.stock = stockBase;

    const res = await fetch(API_PRODUCTO, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Error al actualizar producto");

    mostrarMensaje("✅ Producto actualizado correctamente", "success");
    msgEstado.scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    console.error("❌", err);
    mostrarMensaje(`❌ ${err.message}`, "error");
  } finally {
    form.classList.remove("bloqueado");
  }
});

window.goBack = goBack;
