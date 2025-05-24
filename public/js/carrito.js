"use strict";

// 📦 Referencias DOM
const carritoItems = document.getElementById("carritoItems");
const carritoTotal = document.getElementById("carritoTotal");
const btnIrCheckout = document.getElementById("btnIrCheckout");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const contadorCarrito = document.getElementById("cartCount");

// 🔐 Claves de almacenamiento
const STORAGE_KEY = "km_ez_cart";
const BACKUP_KEY = "km_ez_cart_backup";

let carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ▶️ Al cargar página
document.addEventListener("DOMContentLoaded", () => {
  limpiarItemsInvalidos();
  renderizarCarrito();
  btnIrCheckout?.addEventListener("click", irACheckout);
  btnVaciarCarrito?.addEventListener("click", vaciarCarrito);

  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }
});

/* ───────────────────────────────────────────── */
/* 🧼 Sanitización de datos                      */
/* ───────────────────────────────────────────── */
function sanitizeText(str) {
  const temp = document.createElement("div");
  temp.textContent = str || "";
  return temp.innerHTML.trim();
}

function sanitizeURL(url) {
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return "/assets/logo.jpg";
  }
}

/* ───────────────────────────────────────────── */
/* 💾 Almacenamiento en localStorage             */
/* ───────────────────────────────────────────── */
function guardarCarrito() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  sessionStorage.setItem(BACKUP_KEY, JSON.stringify(carrito));
  actualizarCarritoWidget();
}

function limpiarItemsInvalidos() {
  carrito = carrito.filter(item =>
    item &&
    typeof item.id === "string" &&
    typeof item.nombre === "string" &&
    typeof item.talla === "string" &&
    typeof item.color === "string" &&
    typeof item.imagen === "string" &&
    typeof item.precio === "number" &&
    typeof item.cantidad === "number" &&
    !isNaN(item.precio) &&
    !isNaN(item.cantidad) &&
    item.precio >= 0 &&
    item.cantidad > 0
  );
  guardarCarrito();
}

/* ───────────────────────────────────────────── */
/* 💰 Total y Widget                             */
/* ───────────────────────────────────────────── */
function actualizarTotal() {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  carritoTotal.textContent = `$${total.toFixed(2)}`;
  const deshabilitar = carrito.length === 0;
  btnIrCheckout.disabled = deshabilitar;
  btnVaciarCarrito.disabled = deshabilitar;
}

function actualizarCarritoWidget() {
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  if (contadorCarrito) contadorCarrito.textContent = totalItems;
}

/* ───────────────────────────────────────────── */
/* 🛍️ Renderizar contenido del carrito           */
/* ───────────────────────────────────────────── */
function renderizarCarrito() {
  if (!carrito.length) {
    carritoItems.innerHTML = `
      <div class="text-center fade-in" role="status" aria-live="polite">
        <p>🛍️ Tu carrito está vacío. <a href='/categorias.html'>Explora nuestras categorías</a>.</p>
      </div>`;
    carritoTotal.textContent = "$0.00";
    btnIrCheckout.disabled = true;
    btnVaciarCarrito.disabled = true;
    actualizarCarritoWidget();
    return;
  }

  carritoItems.innerHTML = "";
  carrito.forEach((item, index) => {
    const imagen = sanitizeURL(item.imagen);
    const nombre = sanitizeText(item.nombre);
    const talla = sanitizeText(item.talla || "Única");
    const color = sanitizeText(item.color || "N/A");
    const precio = parseFloat(item.precio) || 0;
    const cantidad = Math.max(1, Math.min(100, parseInt(item.cantidad)));
    const subtotal = (precio * cantidad).toFixed(2);

    const div = document.createElement("div");
    div.className = "carrito-item fade-in";
    div.setAttribute("role", "group");
    div.setAttribute("aria-label", `Producto: ${nombre}, Talla: ${talla}, Color: ${color}, Cantidad: ${cantidad}`);

    div.innerHTML = `
      <img src="${imagen}" alt="${nombre}" class="carrito-img" />
      <div class="carrito-detalles">
        <h4>${nombre}</h4>
        <p><strong>Talla:</strong> ${talla}</p>
        <p><strong>Color:</strong> ${color}</p>
        <p><strong>Precio:</strong> $${precio.toFixed(2)}</p>
        <div class="carrito-cantidad">
          <label for="cantidad_${index}">Cantidad:</label>
          <input type="number" id="cantidad_${index}" min="1" max="100" value="${cantidad}" data-index="${index}" aria-label="Cambiar cantidad de ${nombre}" />
        </div>
        <p><strong>Subtotal:</strong> $${subtotal}</p>
        <button class="btn-eliminar" data-index="${index}" aria-label="Eliminar ${nombre} del carrito">🗑️ Eliminar</button>
      </div>
    `;

    carritoItems.appendChild(div);
  });

  actualizarTotal();
  agregarListeners();
}

/* ───────────────────────────────────────────── */
/* 🧠 Listeners: cantidad y eliminar             */
/* ───────────────────────────────────────────── */
function agregarListeners() {
  const debounce = (fn, delay = 300) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  document.querySelectorAll(".carrito-cantidad input").forEach(input => {
    input.addEventListener("input", debounce(e => {
      const index = parseInt(e.target.dataset.index);
      const cantidad = Math.max(1, Math.min(100, parseInt(e.target.value)));

      if (!isNaN(index) && carrito[index]) {
        carrito[index].cantidad = cantidad;
        guardarCarrito();
        renderizarCarrito();
      }
    }, 300));
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      if (!isNaN(index) && carrito[index]) {
        if (confirm(`❌ ¿Eliminar "${carrito[index].nombre}" del carrito?`)) {
          const itemEl = btn.closest(".carrito-item");
          itemEl.classList.add("fade-out");
          setTimeout(() => {
            carrito.splice(index, 1);
            guardarCarrito();
            renderizarCarrito();
          }, 250);
        }
      }
    });
  });
}

/* ───────────────────────────────────────────── */
/* 🔄 Acciones finales del carrito               */
/* ───────────────────────────────────────────── */
function irACheckout() {
  if (carrito.length > 0) {
    window.location.href = "/checkout.html";
  }
}

function vaciarCarrito() {
  if (confirm("⚠️ ¿Seguro que quieres vaciar todo el carrito?")) {
    sessionStorage.setItem(BACKUP_KEY, JSON.stringify(carrito));
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
  }
}
