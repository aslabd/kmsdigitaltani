var jwt = require('jsonwebtoken');

var connection = require('./../../connection');

var KategoriSchema = require('./../../models/kategorisasi/kategori');

var Kategori = connection.model('Kategori', KategoriSchema);

function KategoriControllers() {
	// Ambil semua kategori
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'z-a') {
			sort = '-nama'
		} else {
			sort = 'nama'
		}

		Kategori
			.find()
			.skip(skip)
			.limit(limit)
			.select({
				subkategori: 0
			})
			.sort(sort)
			.exec(function(err, kategori) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil semua kategori gagal.', err: err});
				} else if (kategori == null || kategori == 0) {
					res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil semua kategori berhasil.', data: kategori});
				}
			})
	}

	// Ambil suatu kategori
	this.get = function(req, res) {
		let id = req.params.id;

		if (id == null || id == 0) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Kategori
				.findById(id)
				.populate('subkategori')
				.exec(function(err, kategori) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil suatu kategori gagal.', err: err});
					} else if (kategori == null || kategori == 0) {
						res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil suatu kategori berhasil.', data: kategori});
					}
				})
		}
	}

	// Tambah kategori
	this.add = function(req, res) {
		let meta = req.body.meta;
		let nama = req.body.nama;
		let deskripsi = req.body.deskripsi;

		if (nama == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else {
			Kategori
				.create({
					meta: meta,
					nama: nama,
					deskripsi: deskripsi
				})
				.then(function(kategori) {
					res.status(200).json({status: true, message: 'Tambah kategori berhasil.'});
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Tambah kategori gagal.', err: err});
				})
		}
	}

	// Ubah kategori
	this.update = function(req, res) {
		let auth = true;

		let id = req.body.id;
		let meta = req.body.meta;
		let nama = req.body.nama;
		let deskripsi = req.body.deskripsi;

		if (id == null || nama == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else {
			Kategori
				.findById(id)
				.then(function(kategori) {
					if (kategori == null || kategori == 0) {
						res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
					} else {
						Kategori
							.findByIdAndUpdate(id, {
								meta: meta,
								nama: nama,
								deskripsi: deskripsi,
								'tanggal.ubah': Date.now()
							})
							.then(function(kategori) {
								res.status(200).json({status: true, message: 'Kategori berhasil diubah.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Kategori gagal diubah.', err: err});
							})
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Kategori gagal ditemukan.', err: err});
				})
		}
	}

	// Hapus kategori
	this.delete = function(req, res) {
		let auth = true;

		let id = req.body.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Kategori
				.findById(id)
				.then(function(kategori) {
					if (kategori == null || kategori == 0) {
						res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
					} else {
						Kategori
							.findByIdAndUpdate(id, {
								status: 'hapus',
								'tanggal.hapus': Date.now()
							})
							.then(function(kategori) {
								res.status(200).json({status: true, message: 'Kategori berhasil dihapus.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Kategori gagal dihapus.', err: err})
							})
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Kategori gagal ditemukan.', err: err});
				})
		}
	}
}

module.exports = new KategoriControllers();