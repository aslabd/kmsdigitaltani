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
	post.getByPenulis(req, res);
});

router.post('/tulis', function(req, res) {
	post.add(req, res);
});

module.exports = router;
