var express = require('express');
var router = express.Router();

var file = require('./../../controllers/materi/file');

router.get('/:filename', function(req, res) {
	file.getFile(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	file.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	file.getByPemilik(req, res);
});

router.post('/upload', function(req, res) {
	file.upload(req, res);
});



module.exports = router;
