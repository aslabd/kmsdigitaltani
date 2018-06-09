// package yang dibutuhkan
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var fetch = require('node-fetch');
var striptags = require('striptags');

// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// konfigurasi lainnya
var configuration = require('./../../configuration');

// skema yang dibutuhkan
var PostSchema = require('./../../models/artikel/post');

// koneksikan skema dengan database
var Post = connection.model('Post', PostSchema);

// deklarasi fungsi lain yang sering digunakan
// Fungsi untuk mengambil meta artikel
async function getMetaForPost(post, res) {
	try {
		let suka = await fetch(configuration.host + '/tanggapan/suka/artikel/' + post._id + '/jumlah');
		let komentar = await fetch(configuration.host + '/tanggapan/komentar/artikel/' + post._id + '/jumlah');
		
		let suka_json = await suka.json();
		let komentar_json = await komentar.json();
		if (suka_json.data[0] == null) {
			post.meta.jumlah.suka = 0;
		} else {
			post.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
		}
		if (komentar_json.data[0] == null) {
			post.meta.jumlah.komentar = 0;
		} else {
			post.meta.jumlah.komentar = komentar_json.data[0].jumlah_komentar;
		}
		res.status(200).json({status: true, message: 'Ambil suatu artikel berhasil.', data: post});
	} catch (err) {
		res.status(500).json({status: false, message: 'Ambil meta artikel gagal.', err: err});
	}
}

async function getMetaForPosts(posts, res) {
	for (let item of posts) {
		try {
			let suka = await fetch(configuration.host + '/tanggapan/suka/artikel/' + item._id + '/jumlah');
			let komentar = await fetch(configuration.host + '/tanggapan/komentar/artikel/' + item._id + '/jumlah');
			
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
			break;
			res.status(500).json({status: false, message: 'Ambil meta artikel gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil artikel berhasil.', data: posts});
}

let getTeksFromHTML = function(html) {
	let teks = striptags(html);
	return teks;
}

let getRingkasanFromTeks = function(teks) {
	let ringkasan = teks.substring(0, 200) + '...';
	return ringkasan;
}

// fungsi controllers Post
function PostControllers() {
	// Ambil semua artikel
	this.getAll = function(req, res) {
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
			Post
				.find()
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
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						getMetaForPosts(post, res);
					}
				});
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
			Post
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
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						getMetaForPosts(post, res);
					}
				});
		}
	}

	this.getAllByPenulis = function(req, res) {
		let auth = true;

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penulis = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi dan otorisasi gagal.'});
		} else {
			let option = JSON.parse(req.params.option);
			let skip = Number(option.skip);
			let limit = Number(option.limit);
			let status = option.status;

			let sort = req.params.sort;
			if (sort == 'terbaru') {
				sort= '-tanggal.terbit';
			} else if (sort == 'terlama') {
				sort= 'tanggal.terbit';
			} else {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			}

			if (status == null) {
				Post
					.find()
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
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
					.exec(function(err, post) {
						if (err) {
							res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
						} else if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							getMetaForPosts(post, res);
						}
					});
			} else {
				Post
					.find()
					.where('penulis').equals(penulis)
					.where('status').equals(status)
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
					.exec(function(err, post) {
						if (err) {
							res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
						} else if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							getMetaForPosts(post, res);
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
			Post
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
						'meta.isi': 0,
						isi: 0,
						suka: 0,
						komentar: 0
					}
				}])
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						getMetaForPosts(post, res);
					}
				});
		}
	}

	this.get = function(req, res) {
		let id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id)
				.select({
					'meta.isi': 0,
					suka: 0,
					komentar: 0
				})
				.populate('subkategori')
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						getMetaForPost(post, res);
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
			let isi = req.body.isi;
			if (meta.isi == null) {
				meta.isi = getTeksFromHTML(isi);
			}
			let ringkasan = req.body.ringkasan;
			if (ringkasan == null) {
				ringkasan = getRingkasanFromTeks(meta.isi);
			}
			let tag = req.body.tag;
			let status = req.body.status;
			let subkategori = req.body.subkategori;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (penulis == null || judul == null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Post
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
					.then(function(post) {
						res.status(200).json({status: true, message: 'Membuat artikel baru berhasil.'});
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Membuat artikel baru gagal.', err: err});
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
			let isi = req.body.isi;
			if (isi.teks == null) {
				isi.teks = getTeksFromHTML(isi.html);
			}
			let ringkasan = req.body.ringkasan;
			if (ringkasan == null) {
				ringkasan = getRingkasanFromTeks(isi.teks);
			}
			let tag = req.body.tag;
			let status = req.body.status;
			let subkategori = req.body.subkategori;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (judul == null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Post
					.findById(id)
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Post
								.findByIdAndUpdate(id, {
									meta: meta,
									judul: judul,
									ringkasan: ringkasan,
									isi: isi,
									tag: tag,
									status: status,
									subkategori: subkategori,
									'tanggal.ubah': Date.now()
								})
								.then(function(post) {
									res.status(200).json({status: true, message: 'Ubah artikel berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Ubah artikel gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					});
			}
		}
	}

	this.delete = function(req, res) {
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			var id = req.body.id;

			if (id == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Post
					.findById(id)
					.select('penulis')
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Post
								.findByIdAndUpdate(id, {
									status: 'hapus',
									'tanggal.hapus': Date.now()
								})
								.then(function(post) {
									res.status(200).json({status: true, message: 'Hapus artikel berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Hapus artikel gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					});
			}
		}	
	}
}

module.exports = new PostControllers();