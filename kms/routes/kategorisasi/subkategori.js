var express = require('express');
var router = express.Router();

var subkategori = require('./../../controllers/kategorisasi/subkategori');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/:id', function(req, res) {
	subkategori.get(req, res);
});

router.get('/kategori/:id_kategori/:option/:sort', function(req, res) {
	subkategori.getAllFromKategori(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	subkategori.getByPenulis(req, res);
});

router.post('/tulis', function(req, res) {
	subkategori.add(req, res);
});

router.patch('/ubah', function(req, res) {
	subkategori.update(req, res);
});

router.delete('/hapus', function(req, res) {
	subkategori.delete(req, res);
});

module.exports = router;
