var express = require('express');
var router = express.Router();

var topik = require('./../../controllers/materi/topik');

router.get('/:filename', function(req, res) {
	topik.gettopik(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	topik.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	topik.getByPemilik(req, res);
});

router.post('/upload', function(req, res) {
	topik.upload(req, res);
});



module.exports = router;
