const express = require('express');
const router = express.Router();
const {
    submitRequest,
    getMyRequests,
    generateAIImage,
    getAllRequests,
    approveRequest,
    rejectRequest,
    proxyDownload,
} = require('../controllers/adRequestController');
const { protect, authorize } = require('../middleware/auth');

// Client routes (authenticated)
router.post('/', protect, submitRequest);
router.get('/mine', protect, getMyRequests);
router.post('/:id/generate-image', protect, generateAIImage);
router.get('/download', protect, proxyDownload);

// Admin routes
router.get('/', protect, authorize('admin'), getAllRequests);
router.put('/:id/approve', protect, authorize('admin'), approveRequest);
router.put('/:id/reject', protect, authorize('admin'), rejectRequest);

module.exports = router;
