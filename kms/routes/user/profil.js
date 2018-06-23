var express = require('express');
var router = express.Router();

var profil = require('./../../controllers/user/profil');

router.get('/', function(req, res) {
	res.status(410).json({status: false, message: 'Tidak ada apa-apa disini.'});
});

router.get('/:id', function(req, res) {
	profil.get(req, res);
});

router.post('/tambah', function(req, res) {
	profil.add(req, res);
});

module.exports = router;
