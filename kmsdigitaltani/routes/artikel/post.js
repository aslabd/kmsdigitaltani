var express = require('express');
var router = express.Router();

var post = require('./../../controllers/artikel/post');

router.get('/:option/:sort', function(req, res) {
	post.getAll(req, res);
});

router.get('/:penulis/:option/:sort', function(req, res) {
	post.getAll(req, res);
});

router.get('/:id', function(req, res) {
	post.get(req, res);
});

router.post('/tulis', function(req, res) {
	post.add(req, res);
});

router.post('/hapus', function(req, res) {
	post.delete(req, res);
});

router.post('/baca', function(req, res) {
	post.delete(req, res);
});

router.post('/suka', function(req, res) {
	post.suka(req, res);
});

router.post('/bagi', function(req, res) {
	post.suka(req, res);
});

module.exports = router;
