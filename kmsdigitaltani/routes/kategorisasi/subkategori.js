var express = require('express');
var router = express.Router();

var subkategori = require('./../../controllers/kategorisasi/subkategori');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/:id', function(req, res) {
	subkategori.get(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	subkategori.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	subkategori.getByPenulis(req, res);
});

router.post('/tulis', function(req, res) {
	subkategori.add(req, res);
});

router.delete('/hapus', function(req, res) {
	subkategori.delete(req, res);
});

module.exports = router;
