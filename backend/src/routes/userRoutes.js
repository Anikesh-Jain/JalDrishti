const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * JalDrishti User Management Routes
 * All endpoints require valid JWT authentication and strict Admin role.
 */
router.use(authenticate);
router.use(requireRole(['Admin']));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
