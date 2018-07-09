var express = require('express');
var router = express.Router();

var meta = require('./../../controllers/meta/meta');

router.get('/profil/:user', function(req, res) {
	meta.getForProfil(req, res);
});

router.get('/:jenis/:id', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.params.id_post = req.params.id;
		meta.getForPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.params.id_tanya = req.params.id;
		meta.getForTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.params.id_topik = req.params.id;
		meta.getForTopik(req, res);
	} else if (req.params.jenis = 'komentar') {
		req.params.id_komentar = req.params.id;
		meta.getForKomentar(req, res);
	} else if (req.params.jenis = 'balasan') {
		req.params.id_balasan = req.params.id;
		meta.getForBalasan(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

module.exports = router;
