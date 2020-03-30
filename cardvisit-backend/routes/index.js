const express = require('express');
const router = express.Router();

const { recoginze } = require('../controllers/ocr');

router.get('/', recoginze);

module.exports = router;
