"use strict";

/**
 * 📦 Módulo modal dinámico y accesible
 * @param {string} titulo - Título del modal.
 * @param {HTMLElement|string} contenido - HTML o texto.
 */

let ultimoFoco = null;
let overlayRef = null;

export function abrirModal(titulo, contenido) {
  cerrarModal(); // Previene duplicados

  ultimoFoco = document.activeElement;

  // 🔲 Overlay
  overlayRef = document.createElement("div");
  overlayRef.id = "modal-overlay";
  overlayRef.className = "modal-overlay fade-in";
  overlayRef.setAttribute("role", "dialog");
  overlayRef.setAttribute("aria-modal", "true");
  overlayRef.setAttribute("aria-labelledby", "modal-titulo");
  overlayRef.tabIndex = -1;

  // 🧱 Modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.tabIndex = -1;

  // ❌ Botón cerrar
  const cerrarBtn = document.createElement("button");
  cerrarBtn.className = "modal-cerrar";
  cerrarBtn.setAttribute("aria-label", "Cerrar modal");
  cerrarBtn.innerHTML = "✖";
  cerrarBtn.addEventListener("click", cerrarModal);

  // 📝 Título
  const tituloNode = document.createElement("h3");
  tituloNode.id = "modal-titulo";
  tituloNode.textContent = titulo;

  // 📄 Contenido
  const contenidoNode = document.createElement("div");
  contenidoNode.className = "modal-contenido";

  if (typeof contenido === "string") {
    contenidoNode.innerHTML = contenido;
  } else if (contenido instanceof HTMLElement) {
    contenidoNode.appendChild(contenido);
  }

  // 🔧 Ensamblar
  modal.append(cerrarBtn, tituloNode, contenidoNode);
  overlayRef.appendChild(modal);
  document.body.appendChild(overlayRef);
  document.body.classList.add("no-scroll");

  // ⌨️ Escape y click afuera
  overlayRef.addEventListener("click", clickFuera);
  document.addEventListener("keydown", cerrarConEscape);

  // ⏱ Foco
  setTimeout(() => modal.focus(), 50);
}

/**
 * ❌ Cierra el modal
 */
export function cerrarModal() {
  if (!overlayRef) return;

  overlayRef.classList.remove("fade-in");
  overlayRef.classList.add("fade-out");

  setTimeout(() => {
    overlayRef?.remove();
    overlayRef = null;
    document.body.classList.remove("no-scroll");

    if (ultimoFoco && typeof ultimoFoco.focus === "function") {
      setTimeout(() => ultimoFoco.focus(), 100);
    }
    ultimoFoco = null;
  }, 200);

  document.removeEventListener("keydown", cerrarConEscape);
}

/**
 * 🖱️ Cierra si se hace clic fuera del modal
 */
function clickFuera(e) {
  if (e.target?.id === "modal-overlay") {
    cerrarModal();
  }
}

/**
 * ⌨️ Cierra con Escape
 */
function cerrarConEscape(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    cerrarModal();
  }
}
