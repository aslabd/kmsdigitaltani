var jwt = require('jsonwebtoken');

var connection = require('./../../connection');

var KategoriSchema = require('./../../models/kategorisasi/kategori');
var SubkategoriSchema = require('./../../models/kategorisasi/subkategori');

var Kategori = connection.model('Kategori', KategoriSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);

function SubkategoriControllers() {
	// Ambil semua subkategori
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let subkategori = Number(option.subkategori);

		Subkategori
			.find()
			.skip(skip)
			.limit(limit)
			.select({
				meta: 1,
				nama: 1,
				deskripsi: 1,
			})
			.sort({
				nama: 1
			})
			.exec(function(err, subkategori) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil semua subkategori gagal.', err: err});
				} else if (subkategori == null || subkategori == 0) {
					res.status(204).json({status: false, message: 'Subategori tidak ditemukan.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil semua subkategori berhasil.', data: subkategori});
				}
			})
	}

	// Ambil suatu kategori
	this.get = function(req, res) {
		let id = req.params.id;

		if (id == null || id == 0) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Subkategori
				.findById(id)
				.exec(function(err, subkategori) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil suatu subkategori gagal.', err: err});
					} else if (subkategori == null || subkategori == 0) {
						res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil suatu kategori berhasil.', data: subkategori});
					}
				})
		}
	}

	// Tambah subkategori
	this.add = function(req, res) {
		let meta = req.body.meta;
		let nama = req.body.nama;
		let deskripsi = req.body.deskripsi;
		let kategori = req.body.kategori;

		if (nama == null || nama == 0) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else {
			Kategori
				.findById(kategori)
				.then(function(kategori) {
					if (kategori == null || kategori == 0) {
						res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
					} else {
						Subkategori
							.create({
								meta: meta,
								nama: nama,
								deskripsi: deskripsi
							})
							.then(function(subkategori) {
								kategori.subkategori
									.push(subkategori._id)

								kategori
									.save(function(err) {
										if (err) {
											Subkategori
												.findByIdAndRemove(subkategori._id)
												.then(function(subkategori) {
													res.status(500).json({status: false, message: 'Menyimpan subkategori baru gagal. Subkategori baru dihapus.', err: err});
												})
												.catch(function(err) {
													res.status(500).json({status: false, message: 'Menyimpan subkategori baru gagal. Menghapus subkategori baru gagal.', err: err})
												})
										} else {
											res.status(200).json({status: true, message: 'Membuat subkategori baru berhasil. Menyimpan subkategori baru berhasil.'})
										}
									})
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Tambah kategori gagal.', err: err});
							})
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil kategori gagal.', err: err});
				})
			
		}
	}
}

module.exports = new SubkategoriControllers();