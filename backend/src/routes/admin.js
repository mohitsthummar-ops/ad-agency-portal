const express = require('express');
const router = express.Router();
const {
    getDashboardStats, getUsers, blockUser, deleteUser, restoreUser,
    getAllAds, deleteAd, getAllTransactions, getSettings, updateSettings,
    getPlans, createPlan, updatePlan, deletePlan, togglePlan,
} = require('../controllers/adminController');
const {
    approveAd, rejectAd,
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin')); // All admin routes are protected + admin-only

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/restore', restoreUser);
router.get('/ads', getAllAds);
router.put('/ads/:id/approve', approveAd);
router.put('/ads/:id/reject', rejectAd);
router.delete('/ads/:id', deleteAd);
router.get('/transactions', getAllTransactions);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Subscription Plan CRUD
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);
router.put('/plans/:id/toggle', togglePlan);

module.exports = router;
