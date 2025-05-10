// 📁 backend/routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { loginAdmin, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('username').isString().trim().isLength({ min: 3 }),
    body('password').isString().trim().isLength({ min: 6 })
  ],
  loginAdmin
);

router.post('/refresh', refreshToken);

export default router;
