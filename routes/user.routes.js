import express from 'express';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/webapp', userController.savePaymentWebApp);
router.post('/user', userController.savePayment);
router.get('/user', userController.getAllPayments);
router.get('/user/:id', userController.getOnePayment);
router.put('/user', userController.updatePayment);
router.put('/user/:id', userController.deletePayment);

export default router;