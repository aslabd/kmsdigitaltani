var express = require('express');
var router = express.Router();

router.all('/', function(req, res) {
  res.status(404).json({status: false, message: 'Tidak ada apa-apa disini.'});
});

module.exports = router;
