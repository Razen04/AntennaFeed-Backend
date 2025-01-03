const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.post('/fetch-article', articleController.fetchArticle);

module.exports = router;