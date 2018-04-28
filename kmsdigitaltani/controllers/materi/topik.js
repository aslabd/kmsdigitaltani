// package yang dibutuhkan
var jwt = require('jsonwebtoken');
var multer = require('multer');
var path = require('path');

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkan
var TopikSchema = require('./../../models/materi/topik');
var FileSchema = require('./../../models/lampiran/file');

// aktifkan skema ke database
var Topik = connection.model('Topik', TopikSchema);
var File = connection.model('File', FileSchema);

function TopikControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

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
			.select({
				meta: 1,
				penulis: 1,
				tanggal: 1,
				judul: 1,
				deskripsi: 1,
				status: 1,
				materi: 1
			})
			.sort({
				sort_attribute: 1
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

	this.getAllByPemilik = function(req, res) {
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
			let pemilik = decoded._id;

			if (status == null) {
				Topik
					.find()
					.skip(skip)
					.limit(limit)
					.where('pemilik').equals(pemilik)
					.select({
						meta: 1,
						penulis: 1,
						tanggal: 1,
						judul: 1,
						deskripsi: 1,
						status: 1,
						materi: 1
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
			} else {
				Topik
					.find()
					.skip(skip)
					.limit(limit)
					.where('pemilik').equals(pemilik)
					.where('status').equals(status)
					.select({
						meta: 1,
						penulis: 1,
						tanggal: 1,
						judul: 1,
						deskripsi: 1,
						status: 1,
						materi: 1
					})
					.sort({
						sort_attribute: terbaru
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

			let decoded = jwt.decoded(req.headers.authorization.split(' ')[1]);
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
						materi: materi
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
}

module.exports = new TopikControllers();
