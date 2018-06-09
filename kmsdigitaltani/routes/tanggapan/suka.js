var express = require('express');
var router = express.Router();

var suka = require('./../../controllers/tanggapan/suka');

router.get('/:jenis/:id/saya', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.params.id_post = req.params.id;
		suka.isSayaSukaPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.params.id_tanya = req.params.id;
		suka.isSayaSukaTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.params.id_topik = req.params.id;
		suka.isSayaSukaTopik(req, res);
	} else if (req.params.jenis = 'komentar') {
		req.params.id_komentar = req.params.id;
		suka.isSayaSukaKomentar(req, res);
	} else if (req.params.jenis = 'balasan') {
		req.params.id_balasan = req.params.id;
		suka.isSayaSukaBalasan(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

router.get('/:jenis/:id/jumlah', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.params.id_post = req.params.id;
		suka.countFromPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.params.id_tanya = req.params.id;
		suka.countFromTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.params.id_topik = req.params.id;
		suka.countFromTopik(req, res);
	} else if (req.params.jenis = 'komentar') {
		req.params.id_komentar = req.params.id;
		suka.countFromKomentar(req, res);
	} else if (req.params.jenis = 'balasan') {
		req.params.id_balasan = req.params.id;
		suka.countFromBalasan(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

router.get('/:jenis/:id/:option', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.params.id_post = req.params.id;
		suka.getAllFromPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.params.id_tanya = req.params.id;
		suka.getAllFromTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.params.id_topik = req.params.id;
		suka.getAllFromTopik(req, res);
	} else if (req.params.jenis = 'komentar') {
		req.params.id_komentar = req.params.id;
		suka.getAllFromKomentar(req, res);
	} else if (req.params.jenis = 'balasan') {
		req.params.id_balasan = req.params.id;
		suka.getAllFromBalasan(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

router.put('/:jenis/ubah', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.body.id_post = req.body.id;
		suka.ubahToPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.body.id_tanya = req.body.id;
		suka.ubahToTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.body.id_topik = req.body.id;
		suka.ubahToTopik(req, res);
	} else if (req.params.jenis = 'komentar') {
		req.body.id_komentar = req.body.id;
		suka.ubahToKomentar(req, res);
	} else if (req.params.jenis = 'balasan') {
		req.body.id_balasan = req.body.id;
		suka.ubahToBalasan(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});



module.exports = router;
