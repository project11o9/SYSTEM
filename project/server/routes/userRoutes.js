const express = require('express');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const {
  getProfile,
  updateProfile,
  saveBank,
  saveUpi,
  submitWithdraw,
  transactionHistory
} = require('../controllers/userController');

const router = express.Router();

router.use(userAuthMiddleware);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/bank', saveBank);
router.post('/upi', saveUpi);
router.post('/withdraw', submitWithdraw);
router.get('/transactions', transactionHistory);

module.exports = router;
