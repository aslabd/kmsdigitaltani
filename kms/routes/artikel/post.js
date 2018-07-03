var express = require('express');
var router = express.Router();

var post = require('./../../controllers/artikel/post');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/:id', function(req, res) {
	post.get(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	post.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	post.getAllBySayaPenulis(req, res);
});

router.get('/suka/:option/:sort', function(req, res) {
	post.getAllBySayaSuka(req, res);
});

router.get('/penulis/:penulis/:option/:sort', function(req, res) {
	post.getAllByPenulis(req, res);
});

router.get('/cari/all/:option/:sort/:search', function(req, res) {
	post.getAllBySearchAll(req, res);
});

router.get('/cari/saya/:option/:sort/:search', function(req, res) {
	post.getAllBySearchSayaPenulis(req, res);
});

router.get('/cari/suka/:option/:sort/:search', function(req, res) {
	post.getAllBySearchSayaSuka(req, res);
});

router.post('/tulis', function(req, res) {
	post.add(req, res);
});

router.patch('/ubah', function(req, res) {
	post.update(req, res);
});

router.delete('/hapus', function(req, res) {
	post.delete(req, res);
});

module.exports = router;
