// 📁 frontend/js/gtag-loader.js

// 🛡️ Asegura la existencia de dataLayer
window.dataLayer = window.dataLayer || [];

/**
 * 🎯 Función para enviar eventos a Google Analytics 4
 * @param  {...any} args 
 */
function gtag(...args) {
  window.dataLayer.push(args);
}

// 🕐 Inicializa GA4 con fecha actual
gtag('js', new Date());

// 🧭 Configura tu ID de GA4 aquí
gtag('config', 'G-BNWNNFDCC3', {
  anonymize_ip: true,       // 🔐 Oculta IP del visitante (RGPD-friendly)
  send_page_view: true      // 📊 Enviar vista de página al cargar
});
