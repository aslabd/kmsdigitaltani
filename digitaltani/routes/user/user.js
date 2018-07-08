var express = require('express');
var router = express.Router();

var user = require('./../../controllers/user/user');

// Semua route dengan method get (Urutan berpengaruh pada hasil)
router.get('/role/:option/:sort', function(req, res) {
	user.getAllByRole(req, res);
});

router.get('/cari/role/:option/:sort/:search', function(req, res) {
	user.getAllByRoleSearch(req, res);
});

router.get('/:id', function(req, res) {
	user.get(req, res);
});

router.post('/login', function(req, res) {
	user.login(req, res);
});

router.post('/auth', function(req, res) {
	user.auth(req, res);
});

router.post('/tambah', function(req, res) {
	user.add(req, res);
});

router.delete('/hapus', function(req, res) {
	user.delete(req, res);
});

module.exports = router;
