var express = require('express');
var router = express.Router();

var file = require('./../../controllers/lampiran/file');

router.get('/:filename', function(req, res) {
	file.getFile(req, res);
});

router.get('/thumbnail/:filename', function(req, res) {
	file.getThumbnail(req, res);
});

router.get('/all/:option', function(req, res) {
	file.getAll(req, res);
});

router.get('/saya/:option', function(req, res) {
	file.getAllBySayaPemilik(req, res);
});

router.post('/upload', function(req, res) {
	file.upload(req, res);
});

module.exports = router;
