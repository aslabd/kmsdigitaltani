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
async function getMetaForPosts(req, posts, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	for (let item of posts) {
		try {
			let meta = await fetch(configuration.host + '/meta/meta/artikel/' + item._id, options);
			let meta_json = await meta.json();
			item.meta = Object.assign(item.meta, meta_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta artikel gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil artikel berhasil.', data: posts});
}

async function getMetaForPost(req, post, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	try {
		let meta = await fetch(configuration.host + '/meta/meta/artikel/' + post._id, options);
		let meta_json = await meta.json();
		post.meta = Object.assign(post.meta, meta_json.data);
		res.status(200).json({status: true, message: 'Ambil artikel berhasil.', data: post});
	} catch (err) {
		console.log(err)
		res.status(500).json({status: false, message: 'Ambil meta artikel gagal.', err: err});
	}
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
				.populate('subkategori', 'nama')
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
						getMetaForPosts(req, post, res);
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
				.populate('subkategori', 'nama')
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
						getMetaForPosts(req, post, res);
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
					.populate('subkategori', 'nama')
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
							getMetaForPosts(req, post, res);
						}
					});
			} else {
				Post
					.find()
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.populate('subkategori', 'nama')
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
							getMetaForPosts(req, post, res);
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
						getMetaForPosts(req, post, res);
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
				.populate('subkategori', 'nama')
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						getMetaForPost(req, post, res);
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