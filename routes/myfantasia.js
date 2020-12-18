const express = require('express');
const router = express.Router();

const { verifyToken } = require('./middlewares/authorization');
const myfantasiaController = require('./controllers/myfantasiaController');

router.get('/',
  verifyToken,
  myfantasiaController.getDiaryListForRequestedMonth
);

router.post('/new',
  verifyToken,
  myfantasiaController.saveOriginalDiary
);

module.exports = router;
