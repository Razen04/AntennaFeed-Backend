const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const rateLimiter = require('../middlewares/rateLimiter')

router.post('/fetch-article', rateLimiter, articleController.fetchArticle);

module.exports = router;