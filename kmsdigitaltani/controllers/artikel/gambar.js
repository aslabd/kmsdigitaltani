// package yang dibutuhkan
var jwt = require('jsonwebtoken');
var multer = require('multer')

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkan
var GambarSchema = require('./../../models/artikel/post');

// aktifkan skema ke database 
var Gambar = connection.model('Gambar', GambarSchema);


function GambarControllers() {
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

			var storage = multer.diskStorage({
				destination: function (req, file, cb) {
			    	direktori = './uploads/gambar/';
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

			var upload = multer({
				storage: storage,
				fileFilter: function(req, file, cb) {
					ukuran = file.size;
					mimetype = file.mimetype;
					let allowed_mimetypes = ['application/pdf'];
					let allowed_extensions = ['.pdf'];
					extension = path.extname(file.originalname).toLowerCase();
					if (file == null || file == 0 || !(allowed_mimetypes.includes(file.mimetype)) || !(allowed_extensions.includes(extension))) {
		            	return cb(new Error('Format file tidak diizinkan.'));
					} else {
						cb(null, true)
					}
				},
				limits: {
					fileSize: 10 * 1024 * 1024
				}
			}).single('materi');

			upload(req, res, function(err) {
				if (req.file == null) {

				} else if (err) {
					res.status(500).json({status: false, message: 'Unggah berkas gagal.', err: err});
				} else {
					Gambar
						.create({
							pemilik: pemilik,
							nama: nama,
							ukuran: ukuran,
							mimetype: mimetype,
							extension: extension,
							direktori: direktori,
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

module.exports = new GambarControllers();