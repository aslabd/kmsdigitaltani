// package yang dibutuhkan
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var fetch = require('node-fetch');

// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// konfigurasi lainnya
var configuration = require('./../../configuration');

// skema yang dibutuhkan
var TanyaSchema = require('./../../models/diskusi/tanya');

// koneksikan skema dengan database
var Tanya = connection.model('Tanya', TanyaSchema);

// Fungsi untuk mengambil meta pertanyaan
async function getMetaForTanya(tanya, res) {
	try {
		let suka = await fetch(configuration.host + '/tanggapan/suka/diskusi/' + tanya._id + '/jumlah');
		let komentar = await fetch(configuration.host + '/tanggapan/komentar/diskusi/' + tanya._id + '/jumlah');
		let suka_json = await suka.json();
		let komentar_json = await komentar.json();
		if (suka_json.data[0] == null) {
			tanya.meta.jumlah.suka = 0;
		} else {
			tanya.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
		}
		if (komentar_json.data[0] == null) {
			tanya.meta.jumlah.komentar = 0;
		} else {
			tanya.meta.jumlah.komentar = komentar_json.data[0].jumlah_komentar;
		}
		res.status(200).json({status: true, message: 'Ambil suatu pertanyaan berhasil.', data: tanya});
	} catch (err) {
		res.status(500).json({status: false, message: 'Ambil meta pertanyaan gagal.', err: err});
	}
}

async function getMetaForTanyas(tanyas, res) {
	for (let item of tanyas) {
		try {
			let suka = await fetch(configuration.host + '/tanggapan/suka/diskusi/' + item._id + '/jumlah');
			let komentar = await fetch(configuration.host + '/tanggapan/komentar/diskusi/' + item._id + '/jumlah');
			
			let suka_json = await suka.json();
			let komentar_json = await komentar.json();
			if (komentar_json.data[0] == null) {
				item.meta.jumlah.komentar = 0;
			} else {
				item.meta.jumlah.komentar = komentar_json.data[0].jumlah_komentar;
			}
			if (suka_json.data[0] == null) {
				item.meta.jumlah.suka = 0;
			} else {
				item.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
			}
		} catch (err) {
			console.log(err);
			break;
			res.status(500).json({status: false, message: 'Ambil meta pertanyaan gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil pertanyaan berhasil.', data: tanyas});
}

function TanyaControllers() {
	// Ambil semua pertanyaan
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let subkategori = option.subkategori;

		let sort = req.params.sort;
		if (sort == 'terbaru') {
			sort = '-tanggal.terbit';
		} else if (sort== 'terlama') {
			sort = 'tanggal.terbit';
		} else {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (subkategori == null) {
			Tanya
				.find()
				.where('status').equals('terbit')
				.populate('subkategori')
				.skip(skip)
				.limit(limit)
				.select({
					suka: 0,
					komentar: 0
				})
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(tanya, res);
					}
				});
		} else {
			Tanya
				.find()
				.where('status').equals('terbit')
				.where('subkategori').equals(subkategori)
				.populate('subkategori')
				.skip(skip)
				.limit(limit)
				.select({
					suka: 0,
					komentar: 0
				})
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(tanya, res);
					}
				});
		}
	}

	this.getAllBySearch = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let subkategori = option.subkategori;

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 'tanggal.terbit';
		} else if (sort == 'terbaru') {
			sort = '-tanggal.terbit';
		} else {
			sort = null;
		}

		let search = req.params.search;
		if (search == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (subkategori == null) {
			Tanya
				.find({
					$text: {
						$search: search
					}
				})
				.where('status').equals('terbit')
				.populate('subkategori')
				.skip(skip)
				.limit(limit)
				.select({
					'meta.isi': 0,
					isi: 0,
					suka: 0,
					komentar: 0
				})
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(post, res);
					}
				});
		} else {
			Tanya
				.find({
					$text: {
						$search: search
					}
				})
				.where('status').equals('terbit')
				.where('subkategori').equals(subkategori)
				.populate('subkategori')
				.skip(skip)
				.limit(limit)
				.select({
					'meta.isi': 0,
					isi: 0,
					suka: 0,
					komentar: 0
				})
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(post, res);
					}
				});
		}
	}

	this.getAllByPenulis = function(req, res) {
		let auth = true;

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let option = JSON.parse(req.params.option);
			let skip = Number(option.skip);
			let limit = Number(option.limit);
			let status = option.status;

			let sort = req.params.sort;
			if (sort== 'terlama') {
				sort = 'tanggal.ubah';
			} else {
				sort = '-tanggal.ubah';
			}

			if (status == null) {
				Tanya
					.find()
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
					.populate('subkategori')
					.skip(skip)
					.limit(limit)
					.select({
						suka: 0,
						komentar: 0
					})
					.sort(sort)
					.exec(function(err, tanya) {
						if (err) {
							res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
						} else if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else {
							getMetaForTanyas(tanya, res);
						}
					});
			} else {
				Tanya
					.find()
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.populate('subkategori')
					.skip(skip)
					.limit(limit)
					.select({
						suka: 0,
						komentar: 0
					})
					.sort(sort)
					.exec(function(err, tanya) {
						if (err) {
							res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
						} else if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else {
							getMetaForTanyas(tanya, res);
						}
					});
			}
		}
	}

	this.getAllBySuka = function(req, res) {
		let auth = true;

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 1;
		} else {
			sort = -1;
		}

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			Tanya
				.aggregate([{
					$lookup: {
						from: 'sukas',
						localField: 'suka',
						foreignField: '_id',
						as: 'suka'
					}
				}, {
					$match: {
						'suka.penyuka': penyuka
					}
				}, {
					$sort: {
						'suka.tanggal': sort
					}
				}, {
					$skip: skip
				}, {
					$limit: limit
				}, {
					$project: {
						isi: 0,
						suka: 0,
						komentar: 0
					}
				}])
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(tanya, res);
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
				.select({
					suka: 0,
					komentar: 0
				})
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanya(tanya, res);
					}
				})
		}
	}

	this.add = function(req, res) {
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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
						} else {
							Tanya
								.findByIdAndUpdate(id, {
									status: 'hapus',
									'tanggal.hapus': Date.now()
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
}

module.exports = new TanyaControllers();