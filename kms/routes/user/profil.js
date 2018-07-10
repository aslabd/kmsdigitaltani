var express = require('express');
var router = express.Router();

var profil = require('./../../controllers/user/profil');

router.get('/:user', function(req, res) {
	profil.getByUser(req, res);
});

router.get('/saya/ikuti/', function(req, res) {
	profil.getAllBySayaMengikuti(req, res);
});

router.get('/saya/pengikut/', function(req, res) {
	profil.getAllBySayaPengikut(req, res);
});

router.get('/ikuti/:pengikut', function(req, res) {
	profil.getAllByPengikutMengikuti(req, res);
});

router.get('/pengikut/:user', function(req, res) {
	profil.getAllByUserPengikut(req, res);
});

router.put('/ikuti', function(req, res) {
	profil.ubah(req, res);
});

router.get('/ikuti/:user/saya', function(req, res) {
	profil.isSayaIkuti(req, res);
});

module.exports = router;
