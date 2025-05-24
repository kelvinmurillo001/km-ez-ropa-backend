// 📁 frontend/js/modoOscuro.js

document.addEventListener("DOMContentLoaded", () => {
  const botonesModoOscuro = document.querySelectorAll("#modoOscuroBtn");
  const body = document.body;
  const root = document.documentElement;

  const activarModoOscuro = () => {
    body.classList.add("modo-oscuro");
    root.classList.add("modo-oscuro");
    localStorage.setItem("modoOscuro", "true");
  };

  const desactivarModoOscuro = () => {
    body.classList.remove("modo-oscuro");
    root.classList.remove("modo-oscuro");
    localStorage.setItem("modoOscuro", "false");
  };

  const toggleModoOscuro = () => {
    const esActivo = body.classList.toggle("modo-oscuro");
    root.classList.toggle("modo-oscuro");
    localStorage.setItem("modoOscuro", esActivo);
  };

  // ⚙️ Aplicar configuración guardada
  if (localStorage.getItem("modoOscuro") === "true") {
    activarModoOscuro();
  }

  // 🎯 Asociar evento a botones
  botonesModoOscuro.forEach((btn) => {
    btn.addEventListener("click", toggleModoOscuro);
  });
});
