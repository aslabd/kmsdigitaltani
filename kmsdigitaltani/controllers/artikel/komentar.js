var jwt =require('jsonwebtoken')

var connection = require('./../../connection');

var PostSchema = require('./../../models/artikel/post');
var KomentarSchema = require('./../../models/artikel/komentar');

var Post = connection.model('Post', PostSchema);
var Komentar = connection.model('Komentar', KomentarSchema);

function KomentarControllers() {
	// Ambil semua komentar (sebagian atribut) di dalam suatu post
	this.getAll = function(req, res) {
		var id_post = req.params.id_post;

		if (id_post == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id_post)
				.populate('komentar', 'meta tanggal penulis isi')
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Komentar berhasil ditemukan.', data: post.komentar})
					}
				});
		}
	}

	// Ambil satu komentar (lengkap) dalam suatu post
	this.get = function(req, res) {
		var id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id)
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil artikel berhasil.', data: post});
					}
				});
		}
	}

	// Tambah komentar
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
			let id_post = req.body.id_post;
			let tanggal = req.body.tanggal;
			let isi = req.body.isi;
			let status = req.body.status;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_post == null || penulis ==  null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Post
					.findById(id_post)
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Komentar
								.create({
									penulis: penulis,
									tanggal: tanggal,
									isi: isi,
									status: status
								})
								.then(function(komentar) {
									// Komentar yang sudah dibuat, ditaruh di post sesuai dengan id_post
									Post
										.findById(id_post)
										.then(function(post) {
											post.komentar
												.push(komentar._id)
											
											post
												.save(function(err) {
													// Jika gagal menyimpan komentar ke post, maka hapus komentar yang sudah dibuat
													if (err) {
														Komentar
															.findByIdAndRemove(komentar._id)
															.then(function(komentar) {
																res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Komentar berhasil dihapus.', err: err});
															})
															.catch(function(err) {
																res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Hapus komentar gagal.', err: err});
															})
													} else {
														res.status(200).json({status: true, message: 'Membuat komentar baru berhasil.'});
													}
												})
										})
										.catch(function(err) {
											res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
										})
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Membuat komentar baru gagal.', err: err});
								})
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Artikel gagal ditemukan.', err: err});
					})
				
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
				var id = req.body.id;

				Komentar
					.findById(id)
					.select('penulis')
					.then(function(komentar) {
						if (komentar == null || komentar == 0) {
							res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
						} else if (auth.role !== 'admin' && komentar.penulis !== auth.id) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'})
						} else {
							Komentar
								.findByIdAndRemove(id)
								.then(function(komentar) {
									res.status(200).json({status: true, message: 'Hapus komentar berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Hapus komentar gagal.', err: err});
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
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
}

module.exports = new KomentarControllers();