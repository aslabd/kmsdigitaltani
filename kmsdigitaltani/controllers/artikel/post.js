var jwt = require('jsonwebtoken');

var connection = require('./../../connection');

var PostSchema = require('./../../models/artikel/post');

var Post = connection.model('Post', PostSchema);

function PostControllers() {
	this.getAll = function(req, res) {
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let sort = JSON.parse(req.params.sort);
		let terbaru = sort.terbaru;
		let terpopuler = sort.terpopuler;

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
					tag: 1
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
		let id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id)
				.select({
					_id: 1,
					meta: 1,
					penulis: 1,
					tanggal: 1,
					judul: 1,
					isi: 1,
					status: 1,
					tag: 1
				})
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
			let terbaru = sort.terbaru;
			let terpopuler = sort.terpopuler;

			if (status == null) {
				Post
					.find()
					.where('penulis').equals(penulis)
					.skip(skip)
					.limit(limit)
					.select({
						_id: 1,
						meta: 1,
						penulis: 1,
						tanggal: 1,
						judul: 1,
						ringkasan: 1,
						status: 1,
						tag: 1
					})
					.sort({
						'tanggal.ubah': terbaru,
						'meta.jumlah_baca': terpopuler
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
						_id: 1,
						meta: 1,
						penulis: 1,
						tanggal: 1,
						judul: 1,
						ringkasan: 1,
						status: 1,
						tag: 1
					})
					.sort({
						'tanggal.ubah': terbaru,
						'meta.jumlah_baca': terpopuler
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
		console.log(option)
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = decoded._id;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
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
					tag: 1
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
			var meta = req.body.meta;
			var tanggal = req.body.tanggal;
			var judul = req.body.judul;
			var ringkasan = req.body.ringkasan;
			var isi = req.body.isi;
			var tag = req.body.tag;
			var status = req.body.status;

			var decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			var penulis = decoded._id;

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
			var meta = req.body.meta;
			var tanggal = req.body.tanggal;
			var judul = req.body.judul;
			var ringkasan = req.body.ringkasan;
			var isi = req.body.isi;
			var tag = req.body.tag;
			var status = req.body.status;

			var decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			var penulis = decoded._id;

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

	this.addBaca = function(req, res) {
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

	this.addSuka = function(req, res) {
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
			let penyuka = decoded._id;

			Post
				.findById(id)
				.select({
					suka: 1
				})
				.then(function(post) {
					if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						post
							.suka.create({
								penyuka: penyuka
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