var express = require('express');
var router = express.Router();

var gambar = require('./../../controllers/lampiran/gambar');

router.get('/:filename', function(req, res) {
	gambar.getGambar(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	gambar.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	gambar.getByPemilik(req, res);
});

router.post('/upload', function(req, res) {
	gambar.upload(req, res);
});



module.exports = router;