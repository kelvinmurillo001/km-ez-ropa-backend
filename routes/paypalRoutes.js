// 📁 routes/paypalRoutes.js
import express from 'express'
import {
  createOrderController,
  captureOrderController
} from '../controllers/paypalController.js'

const router = express.Router()

router.post('/create-order', createOrderController)
router.post('/capture-order', captureOrderController)

export default router
