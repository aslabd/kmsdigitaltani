// package yang dibutuhkan
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkan
var FileSchema = require('./../../models/materi/file');

// aktifkan skema ke database
var File = connection.model('File', FileSchema);


function FileControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = JSON.parse(req.params.sort);
		let terbaru = sort.terbaru;
		let terpopuler = sort.terpopuler;

		File
			.find()
			.where('status').equals('terbit')
			.select({
				meta: 1,
				pemilik: 1,
				tanggal: 1,
				nama: 1,
				ukuran: 1,
				extension: 1
			})
			.sort({
				'tanggal.terbit': terbaru,
				'meta.jumlah_baca': terpopuler
			})
			.exec(function(err, file) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil beberapa materi gagal.', err: err});
				} else if (file == null || file == 0) {
					res.status(204).json({status: false, message: 'Tidak ada materi yang diambil.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil beberapa materi berhasil.', data: file});
				}
			})
	}

	this.getByPemilik = function(req, res) {
		let auth = {
			role: 'admin'
		}
		let role = 'admin'

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let pemilik = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let option = req.params.option;
			let skip = option.skip;
			let limit = option.limit;

			let sort = req.params.sort;
			let terbaru = sort.terbaru;
			let terpopuler = sort.terpopuler;

			File
				.find()
				.skip(skip)
				.limit(limit)
				.where('pemilik').equals(pemilik)
				.exec(function(err, file) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil materi saya gagal.', err: err});
					} else if (file == null || file == 0) {
						res.status(204).json({status: false, message: 'Tidak ada materi yang terambil.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil materi saya berhasil.', data: file})
					}
				})
		}
	}

	this.getFile = function(req, res) {
		let filename = req.params.filename;

		File
			.findOne()
			.where('nama.sistem').equals(filename)
			.exec(function(err, file) {
				if (file == null || file == 0) {
					res.status(204).json({status: false, message: 'File tidak ditemukan.'});
				} else {
					res.download(__dirname + '/../../uploads/materi/' + file.nama.sistem, file.nama.asli, function(err) {
						if (err) {
							res.status(500).json({status: false, message: 'Download materi gagal.', err: err});
						}
					});
				}
			});
	}

	this.upload = function(req, res) {
		let auth = {
			role: 'admin'
		}
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let nama;
			let mimetype;
			let ukuran;
			let extension;
			let direktori;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let pemilik = decoded._id;

			let storage = multer.diskStorage({
				destination: function (req, file, cb) {
			    	direktori = __dirname + '/../../uploads/materi/';
			    	cb(null, direktori)
				},
				filename: function (req, file, cb) {
					nama = {
						asli: file.originalname,
						sistem: file.fieldname + '-' + Date.now() + path.extname(file.originalname).toLowerCase()
					};
			    	cb(null, nama.sistem)
				}
			});

			let upload = multer({
				storage: storage,
				fileFilter: function(req, file, cb) {
					ukuran = file.size;
					mimetype = file.mimetype;
					let allowed_mimetypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'];
					let allowed_extensions = ['.pdf', '.pptx', '.ppt'];
					extension = path.extname(file.originalname).toLowerCase();
					if (!(allowed_mimetypes.includes(file.mimetype)) || !(allowed_extensions.includes(extension))) {
		            	return cb(new Error('File kosong atau format file tidak diizinkan.'));
					} else {
						cb(null, true)
					}
				},
				limits: {
					fileSize: 10 * 1024 * 1024
				}
			}).single('file');

			upload(req, res, function(err) {
				if (req.file == null || req.file == 0) {
					res.status(400).json({status: false, message: 'File kosong.'});
				} else if (err) {
					res.status(500).json({status: false, message: 'Unggah berkas gagal.', err: err});
				} else {
					let deskripsi = req.body.deskripsi;
					let status = req.body.status;
					let judul = req.body.judul;
					let meta = JSON.parse(req.body.meta);
					File
						.create({
							meta: meta,
							pemilik: pemilik,
							nama: nama,
							judul: judul,
							deskripsi: deskripsi,
							ukuran: ukuran,
							mimetype: mimetype,
							extension: extension,
							direktori: direktori,
							status: status,
						})
						.then(function(file) {
							res.status(200).json({status: true, message: 'Unggah materi berhasil.'});
						})
						.catch(function(err) {
							res.status(500).json({status: false, message: 'Unggah materi gagal.'})
						});
				}
			})
		}
	}
}

module.exports = new FileControllers();
