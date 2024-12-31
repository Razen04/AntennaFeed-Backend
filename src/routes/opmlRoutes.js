const express = require('express');
const router = express.Router();
const opmlController = require('../controllers/opmlController');

router.post('/opmltojson', opmlController.convertOpmlToJson);

module.exports = router;