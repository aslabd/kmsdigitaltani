var express = require('express');
var router = express.Router();

var komentar = require('./../../controllers/tanggapan/komentar');

router.get('/:id_post/:option', function(req, res) {
	komentar.getAll(req, res);
});

router.post('/tulis', function(req, res) {
	komentar.add(req, res);
});

router.delete('/hapus', function(req, res) {
	komentar.delete(req, res);
});

module.exports = router;
