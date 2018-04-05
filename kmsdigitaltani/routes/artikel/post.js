var express = require('express');
var router = express.Router();

var post = require('./../../controllers/artikel/post');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/suka/:option', function(req, res) {
	post.getAllBySuka(req, res);
});

router.get('/baca/:option', function(req, res) {
	post.getByBaca(req, res);
});

router.get('/bagi/:option', function(req, res) {
	post.getByBagi(req, res);
});

router.get('/:id', function(req, res) {
	post.get(req, res);
});

router.get('/:option/:sort', function(req, res) {
	post.getAll(req, res);
});

router.get('/:penulis/:option/:sort', function(req, res) {
	post.getAll(req, res);
});

router.post('/tulis', function(req, res) {
	post.add(req, res);
});

router.delete('/hapus', function(req, res) {
	post.delete(req, res);
});

module.exports = router;
