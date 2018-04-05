var express = require('express');
var router = express.Router();

var gambar = require('./../../controllers/artikel/gambar');

router.get('/:filename', function(req, res) {
	gambar.getGambar(req, res);
});

router.get('/:option/:sort', function(req, res) {
	gambar.getAll(req, res);
});

router.post('/upload', function(req, res) {
	gambar.upload(req, res);
});



module.exports = router;
