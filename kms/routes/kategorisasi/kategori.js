var express = require('express');
var router = express.Router();

var kategori = require('./../../controllers/kategorisasi/kategori');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/:id', function(req, res) {
	kategori.get(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	kategori.getAll(req, res);
});

router.post('/tulis', function(req, res) {
	kategori.add(req, res);
});

router.patch('/ubah', function(req, res) {
	kategori.update(req, res);
});

router.delete('/hapus', function(req, res) {
	kategori.delete(req, res);
});

module.exports = router;
