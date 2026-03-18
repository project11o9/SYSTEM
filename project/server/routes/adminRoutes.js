const express = require('express');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const {
  adminLogin,
  listUsers,
  injectWallet,
  updateUserStatus,
  listWithdrawals,
  approveWithdraw,
  rejectWithdraw,
  listBankDetails,
  listUpiDetails,
  listDeposits
} = require('../controllers/adminController');

const router = express.Router();

router.post('/login', adminLogin);
router.use(adminAuthMiddleware);

router.get('/users', listUsers);
router.post('/user/:id/inject', injectWallet);
router.patch('/user/:id/status', updateUserStatus);
router.get('/withdrawals', listWithdrawals);
router.post('/withdraw/:id/approve', approveWithdraw);
router.post('/withdraw/:id/reject', rejectWithdraw);
router.get('/bank-details', listBankDetails);
router.get('/upi-details', listUpiDetails);
router.get('/deposits', listDeposits);

module.exports = router;
