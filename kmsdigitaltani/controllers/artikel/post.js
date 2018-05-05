// package yang dibutuhkan
var jwt = require('jsonwebtoken');

// koneksi database yang dibutuhkan
var connection = require('./../../connection');
var connectionPH = require('./../../connectionPH');

// skema yang dibutuhkan
var PostSchema = require('./../../models/artikel/post');
var UserSchema = require('./../../models/user/user');

// koneksikan skema dengan database
var Post = connection.model('Post', PostSchema);
var User = connectionPH.model('User', UserSchema);


// fungsi controllers Post
function PostControllers() {
	// Ambil semua artikel
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);


		let sort = JSON.parse(req.params.sort);
		let sort_attribute;
		if (sort.terpopuler == null || sort.terpopuler == 0) {
			sort_attribute = 'tanggal.terbit'
		} else {
			sort_attribute = 'meta.jumlah.baca'
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
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
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Artikel berhasil ditemukan', data: post});
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
					bagi: 0,
					baca: 0,
					suka: 0,
					komentar: 0
				})
				.populate('penulis', 'username name email role', User)
				.populate('subkategori')
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil artikel berhasil.', data: post});
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
				sort_attribute = 'tanggal.ubah'
			} else {
				sort_attribute = 'meta.jumlah.baca';
			}

			if (status == null) {
				Post
					.find()
					.where('penulis').equals(penulis)
					.where('status').in(['terbit', 'draft'])
					.skip(skip)
					.limit(limit)
					.select({
						bagi: 0,
						baca: 0,
						suka: 0,
						komentar: 0
					})
					.populate('penulis', 'username name email role', User)
					.populate('subkategori')
					.sort({
						sort_attribute: 1
					})
					.exec(function(err, post) {
						if (err) {
							res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
						} else if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Artikel berhasil ditemukan', data: post});
						}
					});
			} else {
				Post
					.find()
					.where('penulis').equals(penulis)
					.where('status').equals(status)
					.skip(skip)
					.limit(limit)
					.select({
						bagi: 0,
						baca: 0,
						suka: 0,
						komentar: 0
					})
					.populate('penulis', 'username name email role', User)
					.populate('subkategori')
					.sort({
						sort_attribute: 1
					})
					.exec(function(err, post) {
						if (err) {
							res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
						} else if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Artikel berhasil ditemukan', data: post});
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

		let sort = JSON.parse(req.params.sort);
		let sort_attribute;
		if (sort.terpopuler == null || sort.terpopuler == 0) {
			sort_attribute = 'tanggal.terbit';
		} else {
			sort_attribute = 'meta.jumlah.baca';
		}

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			Post
				.find()
				.where('status').in('terbit')
				.where('suka.penyuka').all([penyuka])
				.skip(skip)
				.limit(limit)
				.select({
					bagi: 0,
					baca: 0,
					suka: 0,
					komentar: 0
				})
				.populate('penulis', 'username name email role', User)
				.populate('subkategori')
				.sort({
					sort_attribute: 1
				})
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Artikel berhasil ditemukan', data: post});
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
			let meta = req.body.meta;
			let judul = req.body.judul;
			let ringkasan = req.body.ringkasan;
			let isi = req.body.isi;
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
						} else if (role !== auth.role && post.penulis !== penulis) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'});
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

			if (id == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Post
					.findById(id)
					.select('penulis')
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else if (auth.role !== 'admin' && post.penulis !== auth.id) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'})
						} else {
							Post
								.findByIdAndUpdate(id, {
									status: 'hapus'
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

	this.suka = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let id = req.body.id;
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penyuka = decoded._id;

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Post
					.findById(id)
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Post
								.findById(id)
								.where('suka.penyuka').all([penyuka])
								.exec(function(err, disukai) {
									if (err) {
										res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
									} else if (disukai == null || disukai == 0) {
										post.suka
											.push({
												penyuka: penyuka
											})

										post
											.save(function(err, post) {
												if (err) {
													res.status(500).json({status: false, message: 'Suka artikel gagal.', err: err});
												} else {
													res.status(200).json({status: true, message: 'Suka artikel berhasil.', data: post});
												}
											})
									} else {
										post.suka
											.pull(post.suka[0]._id)

										post
											.save(function(err, post) {
												if (err) {
													res.status(500).json({status: false, message: 'Batal suka artikel gagal.', err: err});
												} else {
													res.status(200).json({status: true, message: 'Batal suka artikel berhasil.', data: post});
												}
											})
									}
								})
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					})
			}
		}
	}
}

module.exports = new PostControllers();