// package yang dibutuhkan
var multer = require('multer');
var path = require('path');
var filepreview = require('filepreview');

var Auth = require('./../../auth');

var configuration = require('./../../configuration');

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkan
var FileSchema = require('./../../models/lampiran/file');

// aktifkan skema ke database
var File = connection.model('File', FileSchema);


function FileControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let jenis = option.jenis;

		if (skip == null || limit == null || jenis == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			File
				.find()
				.where('jenis').equals(jenis)
				.sort('-tanggal.unggah')
				.exec(function(err, file) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil beberapa file gagal.', err: err});
					} else if (file == null || file == 0) {
						res.status(204).json({status: false, message: 'File tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil beberapa file berhasil.', data: file});
					}
				});
		}
	}

	this.getThumbnail = function(req, res) {
		res.sendFile(path.resolve('uploads/thumbnail/' + req.params.filename) , function(err) {
			if (err) {
				res.status(500).json({status: false, message: 'Stream thumbnail gagal.', err: err});
			}
		});
	}

	this.getFile = function(req, res) {
		let filename = req.params.filename;

		File
			.findOne()
			.where('nama.sistem').equals(filename)
			.exec(function(err, file) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil file gagal.', err: err});
				} else if (file == null || file == 0) {
					res.status(204).json({status: false, message: 'File tidak ditemukan.'});
				} else if (file.jenis == 'gambar') {
					res.sendFile(path.resolve('uploads/gambar/' + file.nama.sistem) , function(err) {
						if (err) {
							res.status(500).json({status: false, message: 'Stream gambar gagal.', err: err});
						}
					});
				} else if (file.jenis == 'materi') { 
					res.download(path.resolve('uploads/materi/' + file.nama.sistem), file.nama.asli, function(err) {
						if (err) {
							res.status(500).json({status: false, message: 'Download materi gagal.', err: err});
						}
					});
				}
			});
	}

	this.getAllBySayaPemilik = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let jenis = option.jenis;

		if (skip == null || limit == null || jenis == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let pemilik = auth.data._id;

			File
				.find()
				.skip(skip)
				.limit(limit)
				.where('pemilik').equals(pemilik)
				.where('jenis').equals(jenis)
				.sort('-tanggal.unggah')
				.exec(function(err, file) {
					if (err) {
						res.status(500).json({status: true, message: 'Ambil file saya gagal.', err: err});
					} else if (file == null || file == 0) {
						res.status(204).json({status: false, message: 'File tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil file saya berhasil.', data: file});
					}
				});
		}
	}

	this.upload = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		if (auth == false || auth.status == false) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let meta = {};
			let nama;
			let mimetype;
			let ukuran;
			let extension;
			let direktori;
			let jenis;

			let pemilik = auth.data._id;

			// untuk ukuran file
			let max_size;

			// definisikan mimetypes yang diizinkan
			let gambar_mimetypes = ['image/png', 'image/jpg', 'image/jpeg'];
			let materi_mimetypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'];
			let allowed_mimetypes = [].concat(gambar_mimetypes, materi_mimetypes);
			
			// definisikan ekstensi yang diizinkan
			let gambar_extensions = ['.png', '.jpg', '.jpeg'];
			let materi_extensions = ['.pdf', '.pptx', '.ppt'];
			let allowed_extensions = [].concat(gambar_extensions, materi_extensions);
			
			let storage = multer.diskStorage({
				destination: function (req, file, cb) {
					if ((gambar_mimetypes.includes(file.mimetype)) && (gambar_extensions.includes(extension))) {
		            	jenis = 'gambar';
		            	direktori = path.resolve('uploads/gambar/');
					} else if ((materi_mimetypes.includes(file.mimetype)) && (materi_extensions.includes(extension))) {
						jenis = 'materi';
						direktori = path.resolve('uploads/materi/');
					}
				console.log(file)
			    	cb(null, direktori)
				},
				filename: function (req, file, cb) {
					nama = {
						asli: file.originalname,
						sistem: jenis + '-' + Date.now() + path.extname(file.originalname).toLowerCase()
					};
			    	cb(null, nama.sistem)
				}
			});

			let upload = multer({
				storage: storage,
				fileFilter: function(req, file, cb) {
console.log(file);
					ukuran = file.size;
					extension = path.extname(file.originalname).toLowerCase();
					if (!(allowed_mimetypes.includes(file.mimetype)) || !(allowed_extensions.includes(extension)))  {
						return cb(new Error('File kosong atau format file tidak diizinkan.'));
					} else {
						cb(null, true)
					}
				},
				limits: {
					// mendefinisikan file size yang bisa diupload
					fileSize: 5 * 1024 * 1024
				}
			}).single('file');

			upload(req, res, function(err) {
				if (err) {
					if (err.code == 'LIMIT_FILE_SIZE') {
						res.status(400).json({status: false, message: 'File berukuran melebihi yang diizinkan.', err: err});
					} else {
						console.log(err);
						res.status(500).json({status: false, message: 'File gagal diunggah.', err: err});
					}
				} else if (req.file == null || req.file == 0) {
					res.status(400).json({status: false, message: 'File kosong.'});
				} else {
					filepreview.generate(path.resolve(direktori + '/' + nama.sistem), path.resolve('uploads/thumbnail/' + path.basename(nama.sistem, extension) + '.jpg'), function(err) {
						if (err) {
					    	res.status(500).json({status: false, message: 'Ambil thumbnail file gagal.', err: err})
						} else {
							meta.thumbnail = configuration.host + '/lampiran/file/thumbnail/' + path.basename(nama.sistem, extension) + '.jpg';

							File
								.create({
									meta: meta,
									pemilik: pemilik,
									nama: nama,
									jenis: jenis,
									ukuran: ukuran,
									mimetype: mimetype,
									extension: extension,
									direktori: direktori
								})
								.then(function(file) {
									res.status(200).json({status: true, message: 'Unggah file berhasil.', data: file});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Unggah file gagal.', err: err});
								});
						}
					});
				}
			})
		}
	}
}

module.exports = new FileControllers();
