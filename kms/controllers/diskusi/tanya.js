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
async function getMetaForTanyas(req, tanyas, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	for (let item of tanyas) {
		try {
			let meta = await fetch(configuration.host + '/meta/meta/diskusi/' + item._id, options);
			let meta_json = await meta.json();
			item.meta = Object.assign(item.meta, meta_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta diskusi gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil diskusi berhasil.', data: tanyas});
}

async function getMetaForTanya(req, tanya, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	try {
		let meta = await fetch(configuration.host + '/meta/meta/diskusi/' + tanya._id, options);
		let meta_json = await meta.json();
		tanya.meta = Object.assign(tanya.meta, meta_json.data);
		res.status(200).json({status: true, message: 'Ambil diskusi berhasil.', data: tanya});
	} catch (err) {
		console.log(err)
		res.status(500).json({status: false, message: 'Ambil meta diskusi gagal.', err: err});
	}
}

// fungsi controller Tanya
function TanyaControllers() {
	// Ambil semua pertanyaan
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let subkategori = option.subkategori;

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 'tanggal.terbit';
		} else {
			sort = '-tanggal.terbit';
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (subkategori == null) {
			Tanya
				.find()
				.where('status').equals('terbit')
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		} else {
			Tanya
				.find()
				.where('status').equals('terbit')
				.where('subkategori').equals(subkategori)
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		}
	}

	this.getAllBySaya = function(req, res) {
		let auth = true;
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;

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

		if (skip == null || limit == null || penulis == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (status != null) {
			Tanya
				.find()
				.where('penulis').equals(penulis)
				.where('status').equals(status)
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		} else {
			Tanya
				.find()
				.where('penulis').equals(penulis)
				.where('status').in(['terbit', 'draft'])
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		}
	}

	this.getAllBySuka = function(req, res) {
		let auth = true;
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terlama') {
			sort = 1;
		} else {
			sort = -1;
		}

		if (skip == null || limit == null || penyuka == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false) {
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
						komentar: 0
					}
				}])
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
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

		if (penulis == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Tanya
				.find()
				.where('penulis').equals(penulis)
				.where('status').equals('terbit')
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		}
	}

	this.getAllBySearchAll = function(req, res) {
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

		if (skip == null || limit == null || search == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (subkategori == null) {
			Tanya
				.find({
					$text: {
						$search: search
					}
				})
				.where('status').equals('terbit')
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
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
				.populate('subkategori', 'nama')
				.select({
					suka: 0,
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		}
	}

	this.getAllBySearchSaya = function(req, res) {
		let auth = true;
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;

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


		if (skip == null || limit == null || search == null || penulis == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (status != null) {
			Tanya
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
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		} else {
			Tanya
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
					komentar: 0
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
					}
				});
		}
	}

	this.getAllBySearchSuka = function(req, res) {
		let auth = true;
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

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
		} else if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			Tanya
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
						komentar: 0
					}
				}])
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						getMetaForTanyas(req, tanya, res);
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
				.populate('subkategori', 'nama')
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
						getMetaForTanya(req, tanya, res);
					}
				})
		}
	}

	this.add = function(req, res) {
		let auth = true;
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;
		
		let meta = req.body.meta;
		let judul = req.body.judul;
		let ringkasan = req.body.ringkasan;
		let isi = req.body.isi;
		let tag = req.body.tag;
		let status = req.body.status;
		let subkategori = req.body.subkategori;

		if (penulis == null || judul == null || isi == null || status == null || subkategori == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (status == 'terbit') {
			Tanya
				.create({
					meta: meta,
					penulis: penulis,
					'tanggal.terbit': Date.now,
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

	this.update = function(req, res) {
		let auth = true;
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;

		let id = req.body.id;
		let judul = req.body.judul;
		let isi = req.body.isi;
		let tag = req.body.tag;
		let status = req.body.status;
		let subkategori = req.body.subkategori;

		if (id == null || judul == null || isi == null || status == null || subkategori == null) {
			res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
		} else if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			Tanya
				.findById(id)
				.then(function(tanya) {
					if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else if ((status != tanya.status) && (status == 'terbit')) {
						Tanya
							.findByIdAndUpdate(id, {
								judul: judul,
								isi: isi,
								tag: tag,
								status: status,
								subkategori: subkategori,
								'tanggal.terbit': Date.now(),
								'tanggal.ubah': Date.now()
							})
							.then(function(tanya) {
								res.status(200).json({status: true, message: 'Ubah pertanyaan berhasil.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Ubah pertanyaan gagal.', err: err});
							});
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

	this.delete = function(req, res) {
		let auth = true;
		
		let id = req.body.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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

module.exports = new TanyaControllers();