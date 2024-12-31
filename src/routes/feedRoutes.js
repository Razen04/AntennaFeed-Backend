const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const rateLimiter = require('../middlewares/rateLimiter')

router.post('/fetch',rateLimiter, feedController.fetchFeed);

module.exports = router;