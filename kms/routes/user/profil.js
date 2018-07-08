var express = require('express');
var router = express.Router();

var profil = require('./../../controllers/user/profil');

router.get('/:user', function(req, res) {
	profil.get(req, res);
});

router.put('/ikuti', function(req, res) {
	profil.ubah(req, res);
});

router.put('/ikuti/:user/saya', function(req, res) {
	profil.isSayaIkuti(req, res);
});

router.get('/all/:option/:sort', function(req, res) {
	profil.getAllByRole(req, res);
});

router.get('/cari/:option/:sort/:search', function(req, res) {
	profil.getAllByRoleSearch(req, res);
});

router.post('/tambah', function(req, res) {
	profil.add(req, res);
});

module.exports = router;
