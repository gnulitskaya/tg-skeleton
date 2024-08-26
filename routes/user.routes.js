import express from 'express';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/user', userController.createPayment);
router.get('/user', userController.getAllPayments);
router.get('/user/:id', userController.getOnePayment);
router.put('/user', userController.updatePayment);
router.put('/user/:id', userController.deletePayment);

export default router;