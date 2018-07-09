// package yang dibutuhkan
var mongoose = require('mongoose');
var fetch = require('node-fetch');
var path = require('path');

var Auth = require('./../../auth');

// koneksi ke database
var connection = require('./../../connection');

// konfigurasi lainnya
var configuration = require('./../../configuration');

// skema yang dibutuhkan
var TopikSchema = require('./../../models/materi/topik');
var FileSchema = require('./../../models/lampiran/file');

// aktifkan skema ke database
var Topik = connection.model('Topik', TopikSchema);
var File = connection.model('File', FileSchema);

// Fungsi untuk mengambil meta materi
async function getMetaForTopiks(req, topiks, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	for (let item of topiks) {
		try {
			let meta = await fetch(configuration.host + '/meta/meta/materi/' + item._id, options);
			let meta_json = await meta.json();
			item.meta = Object.assign(item.meta, meta_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta materi gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil materi berhasil.', data: topiks});
}

async function getMetaForTopik(req, topik, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	try {
		let meta = await fetch(configuration.host + '/meta/meta/materi/' + topik._id, options);
		let meta_json = await meta.json();
		topik.meta = Object.assign(topik.meta, meta_json.data);
		res.status(200).json({status: true, message: 'Ambil materi berhasil.', data: topik});
	} catch (err) {
		console.log(err)
		res.status(500).json({status: false, message: 'Ambil meta materi gagal.', err: err});
	}
}

// fungsi controller Materi
function TopikControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 'tanggal.terbit';
		} else {
			sort = '-tanggal.terbit';
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.find()
				.where('status').equals('terbit')
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					materi: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil beberapa materi gagal.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(req, topik, res);
					}
				})
		}
	}

	this.getAllBySayaPenulis = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}


		let option = JSON.parse(req.params.option);
		let skip = option.skip;
		let limit = option.limit;
		let status = option.status;

		let sort = req.params.sort;
		if (sort== 'terlama') {
			sort = 'tanggal.ubah';
		} else {
			sort = '-tanggal.ubah';
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;
			
			if (status != null) {
				Topik
					.find()
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.populate('subkategori', 'nama')
					.select({
						suka: 0,
						materi: 0,
						komentar: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort)
					.exec(function(err, topik) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil materi saya gagal.', err: err});
						} else if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							getMetaForTopiks(req, topik, res);
						}
					});
			} else {
				Topik
					.find()
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
					.populate('subkategori', 'nama')
					.select({
						suka: 0,
						materi: 0,
						komentar: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort)
					.exec(function(err, topik) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil materi saya gagal.', err: err});
						} else if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							getMetaForTopiks(req, topik, res);
						}
					})
			}
		}
	}

	this.getAllBySayaSuka = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 1;
		} else {
			sort = -1;
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penyuka = mongoose.Types.ObjectId(auth.data._id);
			
			Topik
				.aggregate([{
					$match: {
						status: 'terbit'
					}
				}, {
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
					$lookup: {
						from: 'subkategoris',
						localField: 'subkategori',
						foreignField: '_id',
						as: 'subkategori'
					}
				}, {
					$skip: skip
				}, {
					$limit: limit
				}, {
					$project: {
						suka: 0,
						komentar: 0,
						materi: 0
					}
				}])
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(req, topik, res);
					}
				});
		}
	}

	this.getAllByPenulis = function(req, res) {
		let penulis = req.params.penulis;

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort== 'terlama') {
			sort = 'tanggal.terbit';
		} else {
			sort = '-tanggal.terbit';
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.find()
				.where('penulis').equals(penulis)
				.where('status').equals('terbit')
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0,
					materi: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Materi gagal ditemukan.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(req, topik, res);
					}
				});
		}
	}

	this.getAllBySearchAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 'tanggal.terbit';
		} else if (sort == 'terbaru') {
			sort = '-tanggal.terbit';
		} else {
			sort = null;
		}

		let search = req.params.search;

		if (skip == null || limit == null || search == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.find({
					$text: {
						$search: search
					}
				})
				.where('status').equals('terbit')
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0,
					materi: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(req, topik, res);
					}
				});
		}
	}

	this.getAllBySearchSayaPenulis = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}


		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let status = option.status;

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 'tanggal.terbit';
		} else if (sort == 'terbaru') {
			sort = '-tanggal.terbit';
		} else {
			sort = null;
		}

		let search = req.params.search;


		if (skip == null || limit == null || search == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;
			
			if (status != null) {
				Topik
					.find({
						$text: {
							$search: search
						}
					})
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.populate('subkategori', 'nama')
					.select({
						suka: 0,
						komentar: 0,
						materi: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort)
					.exec(function(err, topik) {
						if (err) {
							res.status(500).json({status: false, message: 'Materi gagal ditemukan.', err: err});
						} else if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							getMetaForTopiks(req, topik, res);
						}
					});
			} else {
				Topik
					.find({
						$text: {
							$search: search
						}
					})
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
					.populate('subkategori', 'nama')
					.select({
						suka: 0,
						komentar: 0,
						materi: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort)
					.exec(function(err, topik) {
						if (err) {
							res.status(500).json({status: false, message: 'Materi gagal ditemukan.', err: err});
						} else if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							getMetaForTopiks(req, topik, res);
						}
					});
			}
		}
	}

	this.getAllBySearchSayaSuka = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 1;
		} else {
			sort = -1;
		}

		let search = req.params.search;

		if (skip == null || limit == null || search == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penyuka = mongoose.Types.ObjectId(auth.data._id);
			
			Topik
				.aggregate([{
					$match: {
						$text: {
							$search: search
						}
					}
				}, {
					$match: {
						status: 'terbit'
					}
				}, {
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
					$lookup: {
						from: 'subkategoris',
						localField: 'subkategori',
						foreignField: '_id',
						as: 'subkategori'
					}
				}, {
					$skip: skip
				}, {
					$limit: limit
				}, {
					$project: {
						suka: 0,
						komentar: 0,
						materi: 0
					}
				}])
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Materi gagal ditemukan.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(req, topik, res);
					}
				});
		}
	}

	this.get = function(req, res) {
		let id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.findById(id)
				.populate('materi')
				.populate('subkategori', 'nama')
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopik(req, topik, res);
					}
				});
		}
	}

	this.add = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let meta = req.body.meta;
		let judul = req.body.judul;
		let deskripsi = req.body.deskripsi;
		let status = req.body.status;
		let materi = req.body.materi;
		let tag = req.body.tag;
		let subkategori = req.body.subkategori;

		if (judul == null || status == null || materi == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			if (status == 'terbit') {
				Topik
					.create({
						meta: meta,
						penulis: penulis,
						'tanggal.terbit': Date.now(),
						judul: judul,
						deskripsi: deskripsi,
						status: status,
						materi: materi,
						tag: tag,
						subkategori: subkategori
					})
					.then(function(topik) {
						res.status(200).json({status: true, message: 'Materi baru berhasil dibuat.', data: topik});
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Materi baru gagal dibuat.', err: err});
					});
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
						res.status(200).json({status: true, message: 'Materi baru berhasil dibuat.', data: topik});
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Materi baru gagal dibuat.', err: err});
					});
			}
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
		let judul = req.body.judul;
		let deskripsi = req.body.deskripsi;
		let status = req.body.status;
		let materi = req.body.materi;
		let tag = req.body.tag;
		let subkategori = req.body.subkategori;

		if (id == null || judul == null || status == null || subkategori == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else if (auth == false || auth.status == false || (![1, 2, 3, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Topik
				.findById(id)
				.then(function(topik) {
					if (topik == null || topik == 0 || topik.status == 'hapus') {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else if ((topik.penulis != penulis) && (![1].includes(auth.data.role))) {
						res.status(403).json({status: false, message: 'Anda bukan penulis materi ini atau tidak berhak melakukan ini.'});
					} else if ((status != topik.status) && (status == 'terbit')) {
						Topik
							.findByIdAndUpdate(id, {
								meta: meta,
								judul: judul,
								deskripsi: deskripsi,
								materi: materi,
								tag: tag,
								status: status,
								subkategori: subkategori,
								'tanggal.terbit': Date.now(),
								'tanggal.ubah': Date.now()
							})
							.then(function(topik) {
								res.status(200).json({status: true, message: 'Ubah materi berhasil.', data: topik});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Ubah materi gagal.', err: err});
							});
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
		} else if (auth == false || auth.status == false || (![1, 2, 3, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Topik
				.findById(id)
				.select('penulis')
				.then(function(topik) {
					if (topik == null || topik == 0 || topik.status == 'hapus') {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else if ((topik.penulis != penulis) && (![1].includes(auth.data.role))) {
						res.status(403).json({status: false, message: 'Anda bukan penulis materi ini atau tidak berhak melakukan ini.'});
					} else {
						Topik
							.findByIdAndUpdate(id, {
								status: 'hapus',
								'tanggal.hapus': Date.now()
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
					console.log(err);
					res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
				});
		}
	}

	this.countFromPenulis = function(req, res) {
		let penulis = mongoose.Types.ObjectId(req.params.penulis);

		if (penulis == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.aggregate([{
					$match: {
						penulis: penulis,
					}
				}, {
					$group: {
						_id: '$penulis',
						jumlah_topik: {
							$sum: 1
						}
					}
				}])
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil jumlah materi penulis gagal.', err: err});
					} else {
						res.status(200).json({status: true, message: 'Ambil jumlah materi penulis berhasil.', data: topik})
					}
				});
		}
	}
}

module.exports = new TopikControllers();
