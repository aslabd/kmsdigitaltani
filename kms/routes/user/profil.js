var express = require('express');
var router = express.Router();

var profil = require('./../../controllers/user/profil');

router.get('/:user', function(req, res) {
	profil.getByUser(req, res);
});

router.get('/ikuti/:pengikut', function(req, res) {
	profil.getAllIkuti(req, res);
});

router.get('/pengikut/:user', function(req, res) {
	profil.getAllPengikut(req, res);
});

router.get('/ikuti/:pengikut/cek', function(req, res) {
	profil.getAllIkuti(req, res);
});

router.get('/pengikut/:user/cek', function(req, res) {
	profil.getAllPengikut(req, res);
});

router.put('/ikuti', function(req, res) {
	profil.update(req, res);
});

router.get('/ikuti/:user/saya', function(req, res) {
	profil.isSayaIkuti(req, res);
});

module.exports = router;
