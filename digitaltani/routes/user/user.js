var express = require('express');
var router = express.Router();

var user = require('./../../controllers/user/user');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/:id', function(req, res) {
	user.get(req, res);
});

router.post('/tambah', function(req, res) {
	user.add(req, res);
});

router.patch('/ubah', function(req, res) {
	user.update(req, res);
});

router.delete('/hapus', function(req, res) {
	user.delete(req, res);
});

module.exports = router;
