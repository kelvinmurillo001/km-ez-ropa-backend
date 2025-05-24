"use strict";

import { API_BASE } from "./config.js";

const API_PRODUCTS = `${API_BASE}/api/products`;
const API_PROMOS = `${API_BASE}/api/promos`;
const API_CATEGORIES = `${API_BASE}/api/categories`;

const catalogo = document.getElementById("catalogo");
const categoriaSelect = document.getElementById("categoriaSelect");
const subcategoriaSelect = document.getElementById("subcategoriaSelect");
const precioSelect = document.getElementById("precioSelect");
const busquedaInput = document.getElementById("busquedaInput");
const contadorCarrito = document.getElementById("cartCount");
const promoContainer = document.getElementById("promo-display-container");

let categoriasData = [];

document.addEventListener("DOMContentLoaded", () => {
  aplicarModoOscuro();
  iniciarPagina();
});

function aplicarModoOscuro() {
  const activo = localStorage.getItem("modoOscuro") === "true";
  if (activo) document.body.classList.add("modo-oscuro");

  document.getElementById("modoOscuroBtn")?.addEventListener("click", () => {
    const nuevo = document.body.classList.toggle("modo-oscuro");
    localStorage.setItem("modoOscuro", nuevo);
  });
}

async function iniciarPagina() {
  try {
    await cargarCategoriasDesdeAPI();
    configurarEventosFiltros();
    await cargarPromocionActiva();
    await cargarProductos();
    actualizarContadorCarrito();
  } catch (err) {
    console.error("❌ Error al iniciar:", err);
    renderError("❌ Error al iniciar la página. Intenta más tarde.");
  }
}

function configurarEventosFiltros() {
  categoriaSelect?.addEventListener("change", () => {
    llenarSubcategorias();
    cargarProductos();
  });
  subcategoriaSelect?.addEventListener("change", cargarProductos);
  precioSelect?.addEventListener("change", cargarProductos);
  busquedaInput?.addEventListener("input", debounce(cargarProductos, 400));
}

async function cargarCategoriasDesdeAPI() {
  const res = await fetch(API_CATEGORIES);
  const data = await res.json();
  if (!res.ok || !data.ok || !Array.isArray(data.data)) {
    throw new Error("Error al cargar categorías.");
  }
  categoriasData = data.data;
  llenarCategorias();
  llenarSubcategorias();
}

function llenarCategorias() {
  categoriaSelect.innerHTML = `<option value="">📂 Todas</option>`;
  categoriasData.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = sanitize(cat.name);
    categoriaSelect.appendChild(option);
  });
}

function llenarSubcategorias() {
  subcategoriaSelect.innerHTML = `<option value="">📁 Todas</option>`;
  const categoria = categoriasData.find(c => c.name === categoriaSelect.value);
  if (categoria?.subcategories?.length) {
    categoria.subcategories.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sanitize(sub);
      subcategoriaSelect.appendChild(option);
    });
    subcategoriaSelect.disabled = false;
  } else {
    subcategoriaSelect.disabled = true;
  }
}

async function cargarProductos() {
  if (!catalogo) return;
  catalogo.innerHTML = `<p class='text-center'>⏳ Cargando productos...</p>`;
  try {
    const params = new URLSearchParams();
    if (categoriaSelect.value) params.append("categoria", categoriaSelect.value);
    if (subcategoriaSelect.value) params.append("subcategoria", subcategoriaSelect.value);
    if (busquedaInput.value) params.append("nombre", busquedaInput.value.trim());

    const res = await fetch(`${API_PRODUCTS}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "❌ Error al obtener productos.");

    const productos = Array.isArray(data.productos) ? data.productos : [];
    const filtrados = aplicarFiltrosLocal(productos);
    renderizarCatalogo(filtrados);
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
    renderError("❌ No se pudo cargar el catálogo.");
  }
}

function aplicarFiltrosLocal(productos) {
  const filtroCat = categoriaSelect.value.toLowerCase();
  const filtroSub = subcategoriaSelect.value.toLowerCase();
  const filtroPrecio = precioSelect.value;
  const busqueda = busquedaInput.value.toLowerCase();

  return productos
    .filter(p => !filtroCat || (p.category?.toLowerCase() === filtroCat))
    .filter(p => !filtroSub || (p.subcategory?.toLowerCase() === filtroSub))
    .filter(p => !busqueda || (p.name?.toLowerCase().includes(busqueda)))
    .sort((a, b) => {
      if (filtroPrecio === "low") return a.price - b.price;
      if (filtroPrecio === "high") return b.price - a.price;
      return 0;
    });
}

function renderizarCatalogo(productos) {
  catalogo.innerHTML = "";
  catalogo.setAttribute("role", "list");

  if (!productos.length) {
    renderError("📭 No hay productos que coincidan con los filtros seleccionados.");
    return;
  }

  productos.forEach(p => {
    catalogo.appendChild(crearTarjetaProducto(p));
  });
}

function crearTarjetaProducto(p) {
  const nombre = sanitize(p.name || "Producto");
  const precio = parseFloat(p.price || 0).toFixed(2);
  const imagen = p.image || p.images?.[0]?.url || "/assets/logo.jpg";

  const card = document.createElement("div");
  card.className = "product-card fade-in";
  card.setAttribute("role", "listitem");
  card.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${nombre}" loading="lazy" onerror="this.src='/assets/logo.jpg'" />
    <div class="product-info">
      <h3>${nombre}</h3>
      <p>$${precio}</p>
      <button class="btn-card" onclick="verDetalle('${p._id}')" aria-label="Ver detalle de ${nombre}">👁️ Ver</button>
    </div>
  `;
  return card;
}

function renderError(mensaje = "⚠️ Error al mostrar contenido") {
  catalogo.innerHTML = `<p class="text-center" style="color:red;">${sanitize(mensaje)}</p>`;
}

function verDetalle(id) {
  if (id) window.location.href = `/detalle.html?id=${id}`;
}
window.verDetalle = verDetalle;

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("km_ez_cart")) || [];
  const total = carrito.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  if (contadorCarrito) contadorCarrito.textContent = total;
}

async function cargarPromocionActiva() {
  try {
    const res = await fetch(API_PROMOS);
    const data = await res.json();
    const promo = data?.data?.[0];

    if (res.ok && promo?.active && promoContainer) {
      const { message, mediaUrl, mediaType, color } = promo;
      promoContainer.innerHTML = `
        <div id="promoBanner" class="promo-banner" style="background-color:${color || "#ff6d00"}" role="region" aria-label="Promoción activa">
          ${mediaType === "image" ? `<img src="${mediaUrl}" alt="Promoción activa" />` : ""}
          <span>${sanitize(message)}</span>
        </div>
      `;
    }
  } catch {
    console.warn("⚠️ No se pudo cargar la promoción activa.");
  }
}

function sanitize(text = "") {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.trim();
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
