// package yang dibutuhkan
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');

// koneksi ke database
var connection = require('./../../connection');
var connectionPH = require('./../../connectionPH');;

// skema yang dibutuhkan
var TopikSchema = require('./../../models/materi/topik');
var FileSchema = require('./../../models/lampiran/file');
var UserSchema = require('./../../models/user/user');

// aktifkan skema ke database
var Topik = connection.model('Topik', TopikSchema);
var File = connection.model('File', FileSchema);
var User = connectionPH.model('User', UserSchema);

function TopikControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let subkategori = option.subkategori;

		let sort = JSON.parse(req.params.sort);
		let sort_attribute;
		if (sort.terpopuler == null || sort.terpopuler == 0) {
			sort_attribute = 'tanggal.terbit';
		} else {
			sort_attribute = 'meta.jumlah.baca'
		}

		Topik
			.find()
			.where('status').equals('terbit')
			.where('subkategori').equals(subkategori)
			.populate('subkategori')
			.populate('penulis', 'username name email role', User)
			.select({
				komentar: -1,
				baca: -1,
				suka: -1,
				bagi: -1,
				materi: -1
			})
			.sort({
				sort_attribute: 1
			})
			.exec(function(err, topik) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil beberapa topik gagal.', err: err});
				} else if (topik == null || topik == 0) {
					res.status(204).json({status: false, message: 'Tidak ada topik yang diambil.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil beberapa topik berhasil.', data: topik});
				}
			})
	}

	this.getAllByPenulis = function(req, res) {
		let auth = {
			role: 'admin'
		}
		let role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let option = JSON.parse(req.params.option);
			let skip = option.skip;
			let limit = option.limit;
			let status = option.status;

			let sort = JSON.parse(req.params.sort);
			let sort_attribute;
			if (sort.terpopuler == null || sort.terpopuler == 0) {
				sort_attribute = 'tanggal.terbit';
			} else {
				sort_attribute = 'meta.jumlah.baca';
			}

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (status == null) {
				Topik
					.find()
					.skip(skip)
					.limit(limit)
					.where('penulis').equals(penulis)
					.populate('subkategori')
					.populate('penulis', 'username name email role', User)
					.select({
						komentar: 0,
						baca: 0,
						suka: 0,
						bagi: 0,
						materi: 0
					})
					.sort({
						sort_attribute: 1
					})
					.exec(function(err, file) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil materi saya gagal.', err: err});
						} else if (file == null || file == 0) {
							res.status(204).json({status: false, message: 'Tidak ada materi yang terambil.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil materi saya berhasil.', data: file})
						}
					});
			} else {
				Topik
					.find()
					.skip(skip)
					.limit(limit)
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.populate('subkategori')
					.populate('penulis', 'username name email role', User)
					.select({
						komentar: 0,
						baca: 0,
						suka: 0,
						bagi: 0,
						materi: 0
					})
					.sort({
						sort_attribute: 1
					})
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
	}

	this.get = function(req, res) {
		let id = req.params.id;

		Topik
			.findById(id)
			.populate('materi')
			.populate('subkategori')
			.populate('penulis', 'username name email role', 'User')
			.exec(function(err, topik) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil topik gagal.', err: err});
				} else if (topik == null || topik == 0) {
					res.status(204).json({status: false, message: 'Topik tidak ditemukan.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil topik berhasil.', data: topik})
				}
			})
	}

	this.add = function(req, res) {
		let auth = {
			role: 'admin'
		}
		let role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let meta = req.body.meta;
			let judul = req.body.judul;
			let deskripsi = req.body.deskripsi;
			let status = req.body.status;
			let materi = req.body.materi;
			let tag = req.body.tag;
			let subkategori = req.body.subkategori;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (judul == null || status == null || materi == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Topik
					.create({
						meta: meta,
						penulis: penulis,
						judul: judul,
						deskripsi: deskripsi,
						status: status,
						materi: materi,
						tag: tag,
						subkategori: subkategori
					})
					.then(function(topik) {
						res.status(200).json({status: true, message: 'Topik baru berhasil dibuat.', data: topik});
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Topik baru gagal dibuat.', err: err});
					});
			}
		}
	}

	this.update = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let id = req.body.id;
			let meta = req.body.meta;
			let judul = req.body.judul;
			let deskripsi = req.body.deskripsi;
			let status = req.body.status;
			let materi = req.body.materi;
			let tag = req.body.tag;
			let subkategori = req.body.subkategori;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (judul == null || status == null || subkategori == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Topik
					.findById(id)
					.then(function(topik) {
						if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else if (role !== auth.role && post.penulis !== penulis) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'});
						} else {
							Topik
								.findByIdAndUpdate(id, {
									meta: meta,
									judul: judul,
									deskripsi: deskripsi,
									materi: materi,
									tag: tag,
									status: status,
									subkategori: subkategori,
									'tanggal.ubah': Date.now()
								})
								.then(function(topik) {
									res.status(200).json({status: true, message: 'Ubah materi berhasil.', data: topik});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Ubah materi gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					});
			}
		}
	}

	this.delete = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let id = req.body.id;

			if (id == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Topik
					.findById(id)
					.select('penulis')
					.then(function(topik) {
						if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else if (auth.role !== 'admin' && post.penulis !== auth.id) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'})
						} else {
							Topik
								.findByIdAndUpdate(id, {
									status: 'hapus'
								})
								.then(function(topik) {
									res.status(200).json({status: true, message: 'Hapus materi berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Hapus materi gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					});
			}
		}	
	}
}

module.exports = new TopikControllers();
