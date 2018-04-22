// package yang dibutuhkan
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkan
var GambarSchema = require('./../../models/artikel/gambar');

// aktifkan skema ke database 
var Gambar = connection.model('Gambar', GambarSchema);


function GambarControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = JSON.parse(req.params.sort);
		let terbaru = sort.terbaru;
		let terpopuler = sort.terpopuler;

		Gambar
			.find()
			.select({
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
			.exec(function(err, gambar) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil beberapa gambar gagal.', err: err});
				} else if (gambar == null || gambar == 0) {
					res.status(204).json({status: false, message: 'Tidak ada gambar yang diambil.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil beberapa gambar berhasil.', data: gambar});
				}
			});
	}

	this.getGambar = function(req, res) {
		let filename = req.params.filename;

		Gambar
			.findOne()
			.where('nama.sistem').equals(filename)
			.exec(function(err, gambar) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil gambar gagal.', err: err});
				} else if (gambar == null || gambar == 0) {
					res.status(204).json({status: false, message: 'Gambar tidak ditemukan.'});
				} else {
					res.sendFile(path.resolve('uploads/gambar/' + gambar.nama.sistem) , function(err) {
						if (err) {
							res.status(500).json({status: false, message: 'Stream gambar gagal.', err: err});
						}
					});
				}
			});
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
			let option = JSON.parse(req.params.option);
			let skip = option.skip;
			let limit = option.limit;

			let sort = JSON.parse(req.params.sort);
			let terbaru = sort.terbaru;

			Gambar
				.find()
				.skip(skip)
				.limit(limit)
				.where('pemilik').equals(pemilik)
				.select({
					pemilik: 1,
					tanggal: 1,
					nama: 1,
					ukuran: 1,
					extension: 1
				})
				.sort({
					'tanggal.terbit': terbaru
				})
				.exec(function(err, gambar) {
					if (err) {
						res.status(500).json({status: true, message: 'Ambil gambar saya gagal.', err: err});
					} else if (gambar == null || gambar == 0) {
						res.status(204).json({status: false, message: 'Gambar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil gambar saya berhasil.', data: gambar});
					}
				});
		}
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
			    	direktori = __dirname + '/../../uploads/gambar/';
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
					let allowed_mimetypes = ['image/png', 'image/jpg', 'image/jpeg'];
					let allowed_extensions = ['.png', '.jpg', '.jpeg'];
					extension = path.extname(file.originalname).toLowerCase();
					if (!(allowed_mimetypes.includes(file.mimetype)) || !(allowed_extensions.includes(extension))) {
		            	return cb(new Error('File kosong atau format file tidak diizinkan.'));
					} else {
						cb(null, true)
					}
				},
				limits: {
					fileSize: 2 * 1024 * 1024
				}
			}).single('file');

			upload(req, res, function(err) {
				if (req.file == null || req.file == 0) {
					res.status(400).json({status: false, message: 'Gambar kosong.'});
				} else if (err) {
					res.status(500).json({status: false, message: 'Unggah gambar gagal.', err: err});
				} else {
					Gambar
						.create({
							pemilik: pemilik,
							nama: nama,
							ukuran: ukuran,
							mimetype: mimetype,
							extension: extension,
							direktori: direktori
						})
						.then(function(gambar) {
							res.status(200).json({status: true, message: 'Unggah gambar berhasil.', data: gambar});
						})
						.catch(function(err) {
							res.status(500).json({status: false, message: 'Unggah gambar gagal.'})
						});
				}
			})
		}
	}
}

module.exports = new GambarControllers();