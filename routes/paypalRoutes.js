import express from 'express'
import { crearOrden, capturarOrden } from '../services/paypalService.js'

const router = express.Router()

// Rutas PayPal
router.post('/create-order', async (req, res) => {
  // Crear orden lógica aquí
})

router.post('/capture-order', async (req, res) => {
  // Capturar orden lógica aquí
})

export default router; // 👈 MUY IMPORTANTE
