const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:diaryId', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/new', function(req, res, next) {
  res.send('respond with a resource');
});

router.delete('/delete', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
