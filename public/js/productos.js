"use strict";

import { verificarSesion, goBack, mostrarMensaje } from "./admin-utils.js";
import { API_BASE } from "./config.js";

// 🔐 Token
const token = verificarSesion();

// 📦 Endpoints
const API_PRODUCTS = `${API_BASE}/api/products`;
const API_CATEGORIAS = `${API_BASE}/api/categories`;

// 📌 DOM
const $ = (id) => document.getElementById(id);
const productosLista = $("productosLista");
const inputBuscar = $("buscarProducto");
const filtroCategoria = $("filtroCategoria");
const filtroStock = $("filtroStock");
const filtroDestacados = $("filtroDestacados");
const contadorProductos = $("contadorProductos");
const btnExportar = $("btnExportar");
const paginacion = $("paginacion");

// 📊 Estado
let productosTodos = [];
let paginaActual = 1;
let totalPaginas = 1;
const productosPorPagina = 10;

/* -------------------------------------------------------------------------- */
/* 🚀 INIT                                                                    */
/* -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  if (!productosLista) return;

  inputBuscar?.addEventListener("input", debounce(() => {
    paginaActual = 1;
    cargarProductos();
  }, 400));

  filtroCategoria?.addEventListener("change", () => {
    paginaActual = 1;
    cargarProductos();
  });

  filtroStock?.addEventListener("change", renderizarProductos);
  filtroDestacados?.addEventListener("change", renderizarProductos);
  btnExportar?.addEventListener("click", exportarExcel);

  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }

  await cargarCategorias();
  await cargarProductos();
});

/* -------------------------------------------------------------------------- */
/* 📁 Cargar Categorías                                                       */
/* -------------------------------------------------------------------------- */
async function cargarCategorias() {
  try {
    const res = await fetch(API_CATEGORIAS, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data)) throw new Error(data.message);

    filtroCategoria.innerHTML = `<option value="">📂 Todas las categorías</option>`;
    data.data.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.textContent = `📁 ${sanitize(cat.name)}`;
      filtroCategoria.appendChild(opt);
    });
  } catch (err) {
    mostrarMensaje("❌ No se pudieron cargar las categorías", "error");
  }
}

/* -------------------------------------------------------------------------- */
/* 📦 Cargar Productos                                                        */
/* -------------------------------------------------------------------------- */
async function cargarProductos() {
  productosLista.innerHTML = `<p class="text-center">⏳ Cargando productos...</p>`;
  contadorProductos.textContent = "";
  paginacion.innerHTML = "";

  try {
    const params = new URLSearchParams();
    if (inputBuscar?.value) params.append("nombre", inputBuscar.value.trim());
    if (filtroCategoria?.value) params.append("categoria", filtroCategoria.value);
    params.append("pagina", paginaActual);
    params.append("limite", productosPorPagina);

    const res = await fetch(`${API_PRODUCTS}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener productos");

    productosTodos = Array.isArray(data.data?.productos) ? data.data.productos : [];
    totalPaginas = data.data?.totalPaginas || 1;

    renderizarProductos();
  } catch (err) {
    productosLista.innerHTML = `<p class="text-danger text-center">❌ ${sanitize(err.message)}</p>`;
  }
}

/* -------------------------------------------------------------------------- */
/* 🖼️ Renderizar Productos                                                    */
/* -------------------------------------------------------------------------- */
function renderizarProductos() {
  let productos = [...productosTodos];

  if (filtroStock?.value === "sinStock") {
    productos = productos.filter(p => (p.stockTotal ?? p.stock ?? 0) === 0);
  }

  if (filtroDestacados?.checked) {
    productos = productos.filter(p => p.featured);
  }

  contadorProductos.textContent = `🔍 ${productos.length} producto(s) - Página ${paginaActual} de ${totalPaginas}`;

  if (!productos.length) {
    productosLista.innerHTML = `<p class="text-center">📭 No hay resultados con estos filtros.</p>`;
    paginacion.innerHTML = "";
    return;
  }

  productosLista.innerHTML = `
    <div class="tabla-scroll">
      <table class="tabla-admin productos-table fade-in" aria-label="Listado de productos">
        <thead>
          <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Acciones</th></tr>
        </thead>
        <tbody>${productos.map(productoFilaHTML).join("")}</tbody>
      </table>
    </div>
  `;

  renderPaginacion();
}

/* -------------------------------------------------------------------------- */
/* ⏩ Paginación                                                               */
/* -------------------------------------------------------------------------- */
function renderPaginacion() {
  paginacion.innerHTML = "";
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === paginaActual ? "btn paginacion-activa" : "btn-secundario";
    btn.addEventListener("click", () => {
      paginaActual = i;
      cargarProductos();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    paginacion.appendChild(btn);
  }
}

/* -------------------------------------------------------------------------- */
/* 📄 Generar Fila de Producto                                                */
/* -------------------------------------------------------------------------- */
function productoFilaHTML(p) {
  const imagen = sanitize(p.images?.[0]?.url || "/assets/logo.jpg");
  const nombre = sanitize(p.name || "Sin nombre");
  const precio = isNaN(p.price) ? "0.00" : parseFloat(p.price).toFixed(2);
  const categoria = sanitize(p.category || "-");
  const stock = p.stockTotal ?? p.stock ?? 0;
  const clase = stock === 0 ? "sin-stock" : "";

  return `
    <tr class="${clase}">
      <td><img src="${imagen}" alt="${nombre}" class="producto-img" loading="lazy" /></td>
      <td>${nombre} ${stock === 0 ? '⚠️' : ''}</td>
      <td>$${precio}</td>
      <td>${stock === 0 ? `<span class="stock-alert">Sin stock</span>` : stock}</td>
      <td>${categoria}</td>
      <td>
        <button class="btn-tabla editar" onclick="editarProducto('${p._id}')">✏️</button>
        <button class="btn-tabla eliminar" onclick="eliminarProducto('${p._id}', '${nombre}')">🗑️</button>
      </td>
    </tr>
  `;
}

/* -------------------------------------------------------------------------- */
/* 🗑️ Eliminar Producto                                                       */
/* -------------------------------------------------------------------------- */
async function eliminarProducto(id, nombre) {
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción es irreversible.`)) return;

  try {
    const res = await fetch(`${API_PRODUCTS}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    mostrarMensaje("✅ Producto eliminado correctamente", "success");
    await cargarProductos();
  } catch (err) {
    mostrarMensaje("❌ No se pudo eliminar el producto.", "error");
  }
}

/* -------------------------------------------------------------------------- */
/* 📤 Exportar a Excel (SheetJS)                                              */
/* -------------------------------------------------------------------------- */
async function exportarExcel() {
  btnExportar.disabled = true;
  try {
    const { utils, writeFile } = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");

    const hoja = productosTodos.map(p => ({
      ID: p._id,
      Nombre: p.name,
      Precio: p.price,
      Stock: p.stockTotal ?? p.stock ?? 0,
      Categoría: p.category,
      Destacado: p.featured ? "Sí" : "No"
    }));

    const ws = utils.json_to_sheet(hoja);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Inventario");
    writeFile(wb, `inventario_kmezropa_${Date.now()}.xlsx`);
  } catch (err) {
    mostrarMensaje("❌ Error al exportar productos a Excel", "error");
  } finally {
    btnExportar.disabled = false;
  }
}

/* -------------------------------------------------------------------------- */
/* 🧼 Utilidades                                                              */
/* -------------------------------------------------------------------------- */
function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML.trim();
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 🌍 Funciones globales
window.editarProducto = (id) => location.href = `/editar-producto.html?id=${id}`;
window.eliminarProducto = eliminarProducto;
