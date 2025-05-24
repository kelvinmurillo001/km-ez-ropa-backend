import { API_BASE } from "./config.js";

const DEBUG_VISITAS = false; // Cambiar a true para debug local
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const COOLDOWN_KEY = "visitaRegistrada";
const COOLDOWN_MS = 5000;

/**
 * 📊 Registra una visita anónima (sin necesidad de login).
 */
export function registrarVisitaPublica() {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      if (DEBUG_VISITAS) console.warn("⛔️ Entorno no compatible (SSR o sin DOM).");
      return;
    }

    if (!navigator.onLine) {
      if (DEBUG_VISITAS) console.warn("📴 Usuario sin conexión.");
      return;
    }

    if (sessionStorage.getItem(COOLDOWN_KEY)) {
      if (DEBUG_VISITAS) console.log("🕒 Visita ya registrada en esta sesión.");
      return;
    }

    const payload = {
      pagina: location.pathname || "desconocida",
      titulo: document.title || "sin título",
      fecha: new Date().toISOString(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent || "navegador-desconocido"
    };

    intentarRegistro(payload, 0);
  } catch (error) {
    if (DEBUG_VISITAS) console.error("❌ Error preparando visita:", error);
  }
}

/**
 * 🔁 Intenta enviar la visita con reintentos si falla
 * @param {Object} payload - Datos de visita
 * @param {number} intentoActual - Número de intento actual
 */
function intentarRegistro(payload, intentoActual) {
  fetch(`${API_BASE}/api/visitas/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

      sessionStorage.setItem(COOLDOWN_KEY, "true");
      setTimeout(() => sessionStorage.removeItem(COOLDOWN_KEY), COOLDOWN_MS);

      if (DEBUG_VISITAS) {
        console.log(`✅ Visita registrada (Intento #${intentoActual + 1})`, data);
      }
    })
    .catch((err) => {
      if (intentoActual < MAX_RETRIES) {
        if (DEBUG_VISITAS) {
          console.warn(`⚠️ Fallo al registrar. Reintentando (${intentoActual + 1}/${MAX_RETRIES})`, err.message);
        }
        setTimeout(() => intentarRegistro(payload, intentoActual + 1), RETRY_DELAY_MS);
      } else {
        console.error("❌ Registro de visita falló tras varios intentos:", err.message);
      }
    });
}
