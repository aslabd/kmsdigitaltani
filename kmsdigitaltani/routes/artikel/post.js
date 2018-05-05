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
	post.getAllByPenulis(req, res);
});

router.get('/suka/:option/:sort', function(req, res) {
	post.getAllBySuka(req, res);
});

router.post('/tulis', function(req, res) {
	post.add(req, res);
});

router.delete('/hapus', function(req, res) {
	post.delete(req, res);
});

router.patch('/ubah', function(req, res) {
	post.update(req, res);
});

router.put('/suka', function(req, res) {
	post.suka(req, res);
});

router.put('/baca', function(req, res) {
	post.baca(req, res);
});

router.put('/bagi', function(req, res) {
	post.bagi(req, res);
});

module.exports = router;
