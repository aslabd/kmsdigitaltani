var express = require('express');
var router = express.Router();

var balasan = require('./../../controllers/tanggapan/balasan');

router.get('/komentar/:id_komentar/jumlah', function(req, res) {
	balasan.countFromKomentar(req, res);
});

router.get('/:id_komentar/:option', function(req, res) {
	balasan.getAllFromKomentar(req, res);
});

router.post('/tulis', function(req, res) {
	balasan.add(req, res);
});

router.patch('/ubah', function(req, res) {
	balasan.update(req, res);
});

router.delete('/hapus', function(req, res) {
	balasan.delete(req, res);
});

module.exports = router;
