var express = require('express');
var router = express.Router();

var komentar = require('./../../controllers/tanggapan/komentar');

router.get('/:id', function(req, res) {
	komentar.get(req, res);
});

router.get('/:jenis/:id/jumlah', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.params.id_post = req.params.id;
		komentar.countFromPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.params.id_tanya = req.params.id;
		komentar.countFromTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.params.id_topik = req.params.id;
		komentar.countFromTopik(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

router.get('/:jenis/:id/:option', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.params.id_post = req.params.id;
		komentar.getAllFromPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.params.id_tanya = req.params.id;
		komentar.getAllFromTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.params.id_topik = req.params.id;
		komentar.getAllFromTopik(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

router.post('/:jenis/tulis', function(req, res) {
	if (req.params.jenis == 'artikel') {
		req.body.id_post = req.body.id;
		komentar.addToPost(req, res);
	} else if (req.params.jenis == 'diskusi') {
		req.body.id_tanya = req.body.id;
		komentar.addToTanya(req, res);
	} else if (req.params.jenis == 'materi') {
		req.body.id_topik = req.body.id;
		komentar.addToTopik(req, res);
	} else {
		res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
	}
});

router.patch('/ubah', function(req, res) {
	komentar.update(req, res);
});

router.delete('/hapus', function(req, res) {
	komentar.delete(req, res);
});

module.exports = router;
