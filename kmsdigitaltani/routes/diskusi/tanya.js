var express = require('express');
var router = express.Router();

var tanya = require('./../../controllers/diskusi/tanya');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/:id', function(req, res) {
	tanya.get(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	tanya.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	tanya.getAllByPenulis(req, res);
});

router.get('/suka/:option/:sort', function(req, res) {
	tanya.getAllBySuka(req, res);
});

router.post('/tulis', function(req, res) {
	tanya.add(req, res);
});

router.delete('/hapus', function(req, res) {
	tanya.delete(req, res);
});

router.patch('/ubah', function(req, res) {
	tanya.update(req, res);
});

router.put('/suka', function(req, res) {
	tanya.addSuka(req, res);
});

router.put('/baca', function(req, res) {
	tanya.baca(req, res);
});

router.put('/bagi', function(req, res) {
	tanya.bagi(req, res);
});

module.exports = router;
