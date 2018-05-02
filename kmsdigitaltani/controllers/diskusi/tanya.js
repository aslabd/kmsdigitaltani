// package yang dibutuhkan
var jwt = require('jsonwebtoken');

// koneksi database yang dibutuhkan
var connection = require('./../../connection');
var connectionPH = require('./../../connectionPH');;

// skema yang dibutuhkan
var TanyaSchema = require('./../../models/diskusi/tanya');
var UserSchema = require('./../../models/user/user');

// koneksikan skema dengan database
var Tanya = connection.model('Tanya', TanyaSchema);
var User = connectionPH.model('User', UserSchema);

function TanyaControllers() {
	// Ambil semua pertanyaan
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let subkategori = option.subkategori;

		let sort = JSON.parse(req.params.sort);
		let sort_attribute;
		if (sort.terpopuler == null || sort.terpopuler == 0) {
			sort_attribute = 'tanggal.terbit'
		} else {
			sort_attribute = 'meta.jumlah.baca'
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (subkategori == null || subkategori == 0) {
			Tanya
				.find()
				.where('status').equals('terbit')
				.populate('penulis', 'username name email role', User)
				.populate('subkategori')
				.skip(skip)
				.limit(limit)
				.select({
					bagi: 0,
					baca: 0,
					suka: 0,
					komentar: 0
				})
				.sort({
					sort_attribute: 1
				})
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Pertanyaan berhasil ditemukan', data: tanya});
					}
				});
		} else {
			Tanya
				.find()
				.where('status').equals('terbit')
				.where('subkategori').equals(subkategori)
				.populate('penulis', 'username name email role', User)
				.populate('subkategori')
				.skip(skip)
				.limit(limit)
				.select({
					bagi: 0,
					baca: 0,
					suka: 0,
					komentar: 0
				})
				.sort({
					sort_attribute: 1
				})
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Pertanyaan berhasil ditemukan', data: tanya});
					}
				});
		}
	}

	this.get = function(req, res) {
		let id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Tanya
				.findById(id)
				.populate('subkategori')
				.populate('penulis', 'username name email role', User)
				.select({
					bagi: 0,
					baca: 0,
					suka: 0,
					komentar: 0
				})
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil pertanyaan berhasil.', data: tanya});
					}
				})
		}
	}

	this.getAllByPenulis = function(req, res) {
		let auth = {
			role: 'admin'
		}

		let role = 'admin';

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else if (penulis == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong'});
		} else {
			let option = JSON.parse(req.params.option);
			let skip = Number(option.skip);
			let limit = Number(option.limit);
			let status = option.status;

			let sort = JSON.parse(req.params.sort);
			let sort_attribute;
			if (sort.terpopuler == null || sort.terpopuler == 0) {
				sort_attribute = 'tanggal.terbit';
			} else {
				sort_attribute = 'meta.jumlah.baca';
			}

			if (status == null) {
				Tanya
					.find()
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
					.populate('subkategori')
					.populate('penulis', 'username name email role', User)
					.skip(skip)
					.limit(limit)
					.select({
						bagi: 0,
						baca: 0,
						suka: 0,
						komentar: 0
					})
					.sort({
						sort_attribute: 1
					})
					.exec(function(err, tanya) {
						if (err) {
							res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
						} else if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Pertanyaan berhasil ditemukan', data: tanya});
						}
					});
			} else {
				Tanya
					.find()
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.populate('subkategori')
					.populate('penulis', 'username name email role', User)
					.skip(skip)
					.limit(limit)
					.select({
						bagi: 0,
						baca: 0,
						suka: 0,
						komentar: 0
					})
					.sort({
						sort_attribute: 1
					})
					.exec(function(err, tanya) {
						if (err) {
							res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
						} else if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Pertanyaan berhasil ditemukan', data: tanya});
						}
					});
			}
		}
	}

	this.getAllBySuka = function(req, res) {
		let auth = {
			role: 'admin'
		};

		let role = 'admin';

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			Tanya
				.find()
				.where('status').equals('terbit')
				.where('suka.penyuka').equals(penyuka)
				.skip(skip)
				.limit(limit)
				.select({
					bagi: 0,
					baca: 0,
					suka: 0,
					komentar: 0
				})
				.sort({
					'suka.tanggal': 1
				}) 
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Pertanyaan berhasil ditemukan', data: tanya});
					}
				});
		}
	}

	this.add = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let meta = req.body.meta;
			let judul = req.body.judul;
			let ringkasan = req.body.ringkasan;
			let isi = req.body.isi;
			let tag = req.body.tag;
			let status = req.body.status;
			let subkategori = req.body.subkategori;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (penulis == null || judul == null || isi == null || status == null || subkategori == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Tanya
					.create({
						meta: meta,
						penulis: penulis,
						judul: judul,
						ringkasan: ringkasan,
						isi: isi,
						tag: tag,
						status: status,
						subkategori: subkategori
					})
					.then(function(tanya) {
						res.status(200).json({status: true, message: 'Membuat pertanyaan baru berhasil.', data: tanya});
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Membuat pertanyaan baru gagal.', err: err});
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
			var id = req.body.id;
			var judul = req.body.judul;
			var isi = req.body.isi;
			var tag = req.body.tag;
			var status = req.body.status;
			var subkategori = req.body.subkategori;

			var decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			var penulis = decoded._id;

			if (judul == null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Tanya
					.findById(id)
					.then(function(tanya) {
						if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else if (role !== auth.role && tanya.penulis !== penulis) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'});
						} else {
							Tanya
								.findByIdAndUpdate(id, {
									judul: judul,
									isi: isi,
									tag: tag,
									status: status,
									subkategori: subkategori,
									'tanggal.ubah': Date.now()
								})
								.then(function(tanya) {
									res.status(200).json({status: true, message: 'Ubah pertanyaan berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Ubah pertanyaan gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
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
				Tanya
					.findById(id)
					.select('penulis')
					.then(function(tanya) {
						if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else if (auth.role !== 'admin' && tanya.penulis !== auth.id) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'})
						} else {
							Tanya
								.findByIdAndUpdate(id, {
									status: 'hapus'
								})
								.then(function(tanya) {
									res.status(200).json({status: true, message: 'Hapus pertanyaan berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Hapus pertanyaan gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
					});
			}
		}	
	}

	this.suka = function(req, res) {
		var auth = {
			role: 'admin'
		};
		var role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let id = req.body.id;
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let pembaca = decoded._id;

			if (id == null || pembaca == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Tanya
					.findById(id)
					.then(function(tanya) {
						if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else {
							tanya.suka
								.create({
									pembaca: pembaca
								})
								.then(function(tanya) {
									res.status(200).json({status: true, message: 'Baca pertanyaan berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Baca pertanyaan gagal.', err: err});
								}) 
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
					});
			}		
		}
	}

	this.suka = function(req, res) {
		
	}
}

module.exports = new TanyaControllers();