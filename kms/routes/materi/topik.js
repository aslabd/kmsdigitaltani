var express = require('express');
var router = express.Router();

var topik = require('./../../controllers/materi/topik');

router.get('/:id', function(req, res) {
	topik.get(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	topik.getAll(req, res);
});

router.get('/saya/:option/:sort', function(req, res) {
	topik.getAllBySayaPenulis(req, res);
});

router.get('/suka/:option/:sort', function(req, res) {
	topik.getAllBySayaSuka(req, res);
});

router.get('/penulis/:penulis/jumlah', function(req, res) {
	topik.countFromPenulis(req, res);
});

router.get('/penulis/:penulis/:option/:sort', function(req, res) {
	topik.getAllByPenulis(req, res);
});

router.get('/cari/all/:option/:sort/:search', function(req, res) {
	topik.getAllBySearchAll(req, res);
});

router.get('/cari/saya/:option/:sort/:search', function(req, res) {
	topik.getAllBySearchSayaPenulis(req, res);
});

router.get('/cari/suka/:option/:sort/:search', function(req, res) {
	topik.getAllBySearchSayaSuka(req, res);
});

router.post('/tulis', function(req, res) {
	topik.add(req, res);
});

router.delete('/hapus', function(req, res) {
	topik.delete(req, res);
});

router.patch('/ubah', function(req, res) {
	topik.update(req, res);
});



module.exports = router;
