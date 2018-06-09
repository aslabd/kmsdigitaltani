// package yang dibutuhkan
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var fetch = require('node-fetch');
var multer = require('multer');
var path = require('path');

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
async function getMetaForTopik(topik, res) {
	try {
		let suka = await fetch(configuration.host + '/tanggapan/suka/materi/' + topik._id + '/jumlah');
		let komentar = await fetch(configuration.host + '/tanggapan/komentar/materi/' + topik._id + '/jumlah');
		let suka_json = await suka.json();
		let komentar_json = await komentar.json();
		if (suka_json.data[0] == null) {
			topik.meta.jumlah.suka = 0;
		} else {
			topik.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
		}
		if (komentar_json.data[0] == null) {
			topik.meta.jumlah.komentar = 0;
		} else {
			topik.meta.jumlah.komentar = komentar_json.data[0].jumlah_komentar;
		}
		res.status(200).json({status: true, message: 'Ambil suatu materi berhasil.', data: tanya});
	} catch (err) {
		res.status(500).json({status: false, message: 'Ambil meta materi gagal.', err: err});
	}
}

async function getMetaForTopiks(topiks, res) {
	for (let item of topiks) {
		try {
			let suka = await fetch(configuration.host + '/tanggapan/suka/materi/' + item._id + '/jumlah');
			let komentar = await fetch(configuration.host + '/tanggapan/komentar/materi/' + item._id + '/jumlah');
			
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
			res.status(500).json({status: false, message: 'Ambil meta materi gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil materi berhasil.', data: topiks});
}

function TopikControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = req.params.sort;
		if (sort == 'terbaru') {
			sort = '-tanggal.terbit';
		} else if (sort== 'terlama') {
			sort = 'tanggal.terbit';
		} else {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		}

		Topik
			.find()
			.where('status').equals('terbit')
			.populate('subkategori')
			.select({
				suka: 0,
				materi: 0,
				komentar: 0
			})
			.sort(sort)
			.exec(function(err, topik) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil beberapa materi gagal.', err: err});
				} else if (topik == null || topik == 0) {
					res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
				} else {
					getMetaForTopiks(topik, res);
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
		} else {
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

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (status == null) {
				Topik
					.find()
					.skip(skip)
					.limit(limit)
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
					.populate('subkategori')
					.select({
						suka: 0,
						materi: 0,
						komentar: 0
					})
					.sort(sort)
					.exec(function(err, topik) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil materi saya gagal.', err: err});
						} else if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							getMetaForTopiks(topik, res);
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
					.select({
						suka: 0,
						materi: 0,
						komentar: 0
					})
					.sort(sort)
					.exec(function(err, topik) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil materi saya gagal.', err: err});
						} else if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							getMetaForTopiks(topik, res);
						}
					})
			}
		}
	}

	this.getAllBySearch = function(req, res) {
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
		if (search == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
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
					isi: 0,
					suka: 0,
					komentar: 0
				})
				.sort(sort)
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(topik, res);
					}
				});
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
			Topik
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
						isi: 0,
						suka: 0,
						komentar: 0
					}
				}])
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						getMetaForTopiks(topik, res);
					}
				});
		}
	}

	this.get = function(req, res) {
		let id = req.params.id;

		Topik
			.findById(id)
			.populate('materi')
			.populate('subkategori')
			.exec(function(err, topik) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
				} else if (topik == null || topik == 0) {
					res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
				} else {
					getMetaForTopik(topik, res);
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
		} else {
			let meta = req.body.meta;
			let judul = req.body.judul;
			let deskripsi = req.body.deskripsi;
			let status = req.body.status;
			let materi = req.body.materi;
			// if (meta.thumbnail == null || meta.thumbnail == 0) {
			// 	if (materi == null || materi == 0) {
			// 		meta.thumbnail = null;
			// 	} else {
			// 		File
			// 			.findById(materi[0])
			// 			.then(function(file) {
			// 				if (file == null || file == 0) {
			// 					console.log("wow")
			// 					meta.thumbnail = null;
			// 				} else {
			// 					console.log("wiw")
			// 					meta.thumbnail = file.meta.thumbnail;
			// 				}
			// 			})
			// 			.catch(function(err) {
			// 				res.status(500).json({status: false, message: 'Ambil file gagal.', err: err});
			// 			})
			// 	}
			// }
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
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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
		let auth = true

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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
