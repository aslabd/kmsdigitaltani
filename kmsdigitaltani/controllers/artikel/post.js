var connection = require('./../../connection');

var PostSchema = require('./../../models/artikel/post');

var Post = connection.model('Post', PostSchema);

function PostControllers() {
	this.getAll = function(req, res) {
		var skip = Number(req.params.skip);
		var limit = Number(req.params.limit);
		var terbaru = req.params.terbaru;
		var terpopuler = req.params.terpopuler;

		if (skip == null || limit == null || terbaru == null || terpopuler == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.find()
				.where('status').equals('terbit')
				.skip(skip)
				.limit(limit)
				.select({
					_id: 1,
					meta: 1,
					penulis: 1,
					tanggal: 1,
					judul: 1,
					ringkasan: 1,
					status: 1
				})
				.sort({
					'meta.jumlah_baca': terpopuler,
					'tanggal.terbit': terbaru
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
		var id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id, 'meta penulis tanggal judul isi tag status')
				.then(function(post) {
					if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil artikel berhasil.', data: post});
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
				});
		}
	}

	this.getByPenulis = function(req, res) {
		var auth = {
			role: 'admin'
		}
		var role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			Post
				.find()
		}
	}

	this.add = function(req, res) {
		var auth = {
			role: 'admin'
		};
		var role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			var meta = req.body.meta;
			var penulis = req.body.penulis;
			var tanggal = req.body.tanggal;
			var judul = req.body.judul;
			var ringkasan = req.body.ringkasan;
			var isi = req.body.isi;
			var tag = req.body.tag;
			var status = req.body.status;

			if (penulis == null || judul == null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Post
					.create({
						meta: meta,
						penulis: penulis,
						tanggal: tanggal,
						judul: judul,
						ringkasan: ringkasan,
						isi: isi,
						tag: tag,
						status: status
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
		var auth = {
			role: 'admin'
		};
		var role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			var id = req.body.id;
			var meta = req.body.meta;
			var tanggal = req.body.tanggal;
			var judul = req.body.judul;
			var ringkasan = req.body.ringkasan;
			var isi = req.body.isi;
			var kategori = req.body.kategori;
			var tag = req.body.tag;
			var status = req.body.status;

			if (judul == null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Post
					.findById(id)
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else if (role !== auth.role && post.penulis !== auth.id) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'});
						} else {
							Post
								.findByIdAndUpdate(id, {
									meta: meta,
									tanggal: tanggal,
									judul: judul,
									ringkasan: ringkasan,
									isi: isi,
									tag: tag,
									status: status
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
		var auth = {
			role: 'admin'
		};
		var role = 'admin';

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
								.findByIdAndRemove(id)
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

	this.baca = function(req, res) {
		var id = req.body.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id)
				.then(function(post) {
					if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						if (auth.id !== null) {
							post
								.baca.create({
									pembaca: auth.id
								})
								.then(function(post) {
									res.status(200).json({status: true, message: 'Baca artikel berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Baca artikel gagal.', err: err});
								});
						} else {
							post
								.baca.create({
									pembaca: null
								})
								.then(function(post) {
									res.status(200).json({status: true, message: 'Baca artikel berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Baca artikel gagal.', err: err});
								});
						}
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err})
				});
		}
	}

	this.suka = function(req, res) {
		var auth = {
			role: 'admin'
		};
		var role = 'admin'
		var id = req.body.id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			Post
				.findById(id)
				.then(function(post) {
					if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						post
							.suka.create({
								penyuka: auth.id
							})
							.then(function(post) {
								res.status(200).json({status: true, message: 'Suka artikel berhasil.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Suka artikel gagal.', err: err});
							}) 
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
				});
		}
	}

	this.bagi = function(req, res) {

	}
}

module.exports = new PostControllers();