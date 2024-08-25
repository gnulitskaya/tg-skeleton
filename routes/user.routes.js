import express from 'express';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/user', userController.createUser);
router.get('/user', userController.getUsers);
router.get('/user/:id', userController.getOneUser);
router.post('/user', userController.createUser);
router.put('/user', userController.updateUser);
router.put('/user/:id', userController.deleteUser);

export default router;