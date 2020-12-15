const express = require('express');
const router = express.Router();

const { verifyToken } = require('./middlewares/authorization');
const myfantasiaController = require('./controllers/myfantasiaController');

router.get('/',
  verifyToken,
);

router.get('/:diaryId',
  verifyToken,
);

router.post('/new',
  verifyToken,
  myfantasiaController.saveOriginalDiary
);

router.delete('/delete',
  verifyToken,
);

module.exports = router;
