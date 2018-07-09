var express = require('express');
var router = express.Router();

var meta = require('./../../controllers/meta/meta');

router.get('/profil/:user', function(req, res) {
	meta.getForProfil(req, res);
});

router.get('/:jenis/:id', function(req, res) {
	if (req.params.jenis == 'artikel') {
		meta.getForPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		meta.getForTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		meta.getForTopik(req, res);
	} else if (req.params.jenis == 'komentar') {
		meta.getForKomentar(req, res);
	} else if (req.params.jenis == 'balasan') {
		meta.getForBalasan(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

module.exports = router;
