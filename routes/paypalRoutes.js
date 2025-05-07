// 📁 backend/routes/paypalRoutes.js
import express from 'express'
import {
  createOrderController,
  captureOrderController,
  validateCreateOrder,
  validateCaptureOrder
} from '../controllers/paypalController.js'

const router = express.Router()

router.post('/create-order', validateCreateOrder, createOrderController)
router.post('/capture-order', validateCaptureOrder, captureOrderController)

export default router
