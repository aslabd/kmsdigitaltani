var Auth = require('./../../auth');

var connection = require('./../../connection');

var KategoriSchema = require('./../../models/kategorisasi/kategori');
var SubkategoriSchema = require('./../../models/kategorisasi/subkategori');

var Kategori = connection.model('Kategori', KategoriSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);

function SubkategoriControllers() {
	// Ambil semua subkategori
	this.getAllFromKategori = function(req, res) {
		let id_kategori = req.params.id_kategori;

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'z-a') {
			sort = -1
		} else {
			sort = 1
		}

		Kategori
			.findById(id_kategori)
			.populate({
				path: 'subkategori',
					match: {
						status: {
							$eq: 'terbit'
						}
					},
					skip: skip,
					limit: limit,
					options: {
						sort: {
							nama: sort
						}
					}
			})
			.select({
				subkategori: 1
			})
			.exec(function(err, kategori) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil semua subkategori gagal.', err: err});
				} else if (kategori == null || kategori == 0) {
					res.status(204).json({status: false, message: 'Kategori tidak ditemukan.'});
				} else if (kategori.subkategori == null || kategori.subkategori == 0) {
					res.status(204).json({status: false, message: 'Subkategori tidak ditemukan.'});
				} else {
					res.status(200).json({status: true, message: 'Ambil semua subkategori berhasil.', data: kategori.subkategori});
				}
			})
	}

	this.countFromKategori = function(req, res) {
		let id_kategori = mongoose.Types.ObjectId(req.params.id_kategori);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		Kategori
			.aggregate([{
				$match: {
					_id: id_kategori
				}
			}, {
				$unwind: '$subkategori'	// pecah data untuk setiap komentar
			}, {
				$lookup: {
					from: 'subkategoris',	// menggunakan nama collection pada database
					localField: 'subkategori',
					foreignField: '_id',
					as: 'subkategori'
				}
			}, {
				$match: {
					'subkategori.status': 'terbit'
				}
			}, {
				$group: {
					_id: '$_id',
					jumlah_subkategori: {
						$sum: 1
					}
				}
			}])
			.exec(function(err, subkategori) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil jumlah subkategori di suatu kategori gagal.', err: err});
				} else {
					res.status(200).json({status: true, message: 'Ambil jumlah subkategori di suatu kategori berhasil.', data: subkategori});
				}
			});
	}

	// Ambil suatu subkategori
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
						res.status(204).json({status: false, message: 'Subkategori tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil suatu subkategori berhasil.', data: subkategori});
					}
				})
		}
	}

	// Tambah subkategori
	this.add = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let meta = req.body.meta;
		let nama = req.body.nama;
		let deskripsi = req.body.deskripsi;
		let kategori = req.body.kategori;

		if (nama == null || kategori == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else if (auth == false || auth.status == false || (![1].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
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

	this.update = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		let id = req.body.id;
		let meta = req.body.meta;
		let nama = req.body.nama;
		let deskripsi = req.body.deskripsi;
		let kategori = req.body.kategori;

		if (id == null || nama == null || kategori == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else if (auth == false || auth.status == false || (![1].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			Subkategori
				.findById(id)
				.then(function(subkategori) {
					if (subkategori == null || subkategori == 0 || subkategori.status == 'hapus') {
						res.status(204).json({status: false, message: 'Subkategori tidak ditemukan.'});
					} else {
						Subkategori
							.findByIdAndUpdate(id, {
								meta: meta,
								nama: nama,
								deskripsi: deskripsi,
								kategori: kategori,
								'tanggal.ubah': Date.now()
							})
							.then(function(subkategori) {
								res.status(200).json({status: true, message: 'Subkategori berhasil diubah.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Subkategori gagal diubah.', err: err});
							})
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Subkategori gagal ditemukan.', err: err});
				})
		}
	}

	this.delete = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		let id = req.body.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![1].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			Subkategori
				.findById(id)
				.then(function(subkategori) {
					if (subkategori == null || subkategori == 0 || subkategori.status == 'hapus') {
						res.status(204).json({status: false, message: 'Subkategori tidak ditemukan.'});
					} else {
						Subkategori
							.findByIdAndUpdate(id, {
								status: 'hapus',
								'tanggal.hapus': Date.now()
							})
							.then(function(subkategori) {
								res.status(200).json({status: true, message: 'Subkategori berhasil dihapus.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Subkategori gagal dihapus.', err: err})
							})
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Subkategori gagal ditemukan.', err: err});
				})
		}
	}
}

module.exports = new SubkategoriControllers();