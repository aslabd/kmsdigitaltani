var express = require('express');
var router = express.Router();

var balasan = require('./../../controllers/tanggapan/balasan');

router.get('/:id_komentar', function(req, res) {
	balasan.getAll(req, res);
});

router.post('/tulis', function(req, res) {
	balasan.add(req, res);
});

router.delete('/hapus', function(req, res) {
	balasan.delete(req, res);
});

module.exports = router;
