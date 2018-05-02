var jwt =require('jsonwebtoken');

var connection = require('./../../connection');

var PostSchema = require('./../../models/artikel/post');
var TanyaSchema = require('./../../models/diskusi/tanya');
var TopikSchema = require('./../../models/artikel/post');
var KomentarSchema = require('./../../models/tanggapan/komentar');

var Post = connection.model('Post', PostSchema);
var Komentar = connection.model('Komentar', KomentarSchema);

function KomentarControllers() {
	// Ambil semua komentar (sebagian atribut) di dalam suatu post
	this.getAllFromPost = function(req, res) {
		let id_post = req.params.id_post;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_post == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.findById(id_post)
				.populate({
					path: 'komentar',
					match: {
						status: {
							$eq: 'terbit'
						}
					},
					skip: skip,
					limit: limit,
					select: {
						suka: 0,
						balasan: 0
					}
				})
				.select({
					komentar: 1
				})
				.exec(function(err, post) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (post.komentar == null || post.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Komentar berhasil ditemukan.', data: post.komentar})
					}
				});
		}
	}

	this.getAllFromTanya = function(req, res) {
		let id_tanya = req.params.id_tanya;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_tanya == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Tanya
				.findById(id_tanya)
				.populate({
					path: 'komentar',
					match: {
						status: {
							$eq: 'terbit'
						}
					},
					skip: skip,
					limit: limit,
					select: {
						suka: 0,
						balasan: 0
					}
				})
				.select({
					komentar: 1
				})
				.exec(function(err, tanya) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (tanya.komentar == null || tanya.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Komentar berhasil ditemukan.', data: tanya.komentar})
					}
				});
		}
	}

	this.getAllFromTopik = function(req, res) {
		let id_topik = req.params.id_topik;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_topik == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.findById(id_topik)
				.populate({
					path: 'komentar',
					match: {
						status: {
							$eq: 'terbit'
						}
					},
					skip: skip,
					limit: limit,
					select: {
						suka: 0,
						balasan: 0
					}
				})
				.select({
					komentar: 1
				})
				.exec(function(err, topik) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (topik.komentar == null || topik.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Komentar berhasil ditemukan.', data: topik.komentar})
					}
				});
		}
	}

	// Ambil satu komentar (lengkap) dalam suatu post
	this.getById = function(req, res) {
		var id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Komentar
				.findById(id)
				.populate('balasan')
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil komentar berhasil.', data: komentar});
					}
				});
		}
	}

	// Tambah komentar di Artikel
	this.addToPost = function(req, res) {
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
									isi: isi,
									status: status
								})
								.then(function(komentar) {
									// Komentar yang sudah dibuat, ditaruh di post sesuai dengan id_post
									post.komentar
										.push(komentar._id)
											
									post
										.save(function(err, post) {
											// Jika gagal menyimpan komentar ke post, maka hapus komentar yang sudah dibuat
											if (err) {
												Komentar
													.findByIdAndRemove(komentar._id)
													.then(function(komentar) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Menghapus komentar berhasil.', err: err});
													})
													.catch(function(err) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Menghapus komentar gagal.', err: err});
													})
											} else {
												res.status(200).json({status: true, message: 'Membuat komentar baru berhasil.'});
											}
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

	// Tambah komentar ke Diskusi
	this.addToTanya = function(req, res) {
		var auth = {
			role: 'admin'
		};
		var role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let id_tanya = req.body.id_tanya;
			let isi = req.body.isi;
			let status = req.body.status;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_tanya == null || penulis ==  null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Tanya
					.findById(id_tanya)
					.then(function(tanya) {
						if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Komentar
								.create({
									penulis: penulis,
									isi: isi,
									status: status
								})
								.then(function(komentar) {
									// Komentar yang sudah dibuat, ditaruh di pertanyaan sesuai dengan id_tanya
									tanya.komentar
										.push(komentar._id)
											
									tanya
										.save(function(err, tanya) {
											// Jika gagal menyimpan komentar ke pertanyaan, maka hapus komentar yang sudah dibuat
											if (err) {
												Komentar
													.findByIdAndRemove(komentar._id)
													.then(function(komentar) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Menghapus komentar berhasil.', err: err});
													})
													.catch(function(err) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Menghapus komentar gagal.', err: err});
													})
											} else {
												res.status(200).json({status: true, message: 'Membuat komentar baru berhasil.', data: komentar});
											}
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

	// Tambah komentar ke Materi
	this.addToTopik = function(req, res) {
		var auth = {
			role: 'admin'
		};
		var role = 'admin';

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else if (role !== auth.role) {
			res.status(401).json({status: false, message: 'Otorisasi gagal.'});
		} else {
			let id_topik = req.body.id_topik;
			let isi = req.body.isi;
			let status = req.body.status;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_topik == null || penulis ==  null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Topik
					.findById(id_topik)
					.then(function(topik) {
						if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Komentar
								.create({
									penulis: penulis,
									isi: isi,
									status: status
								})
								.then(function(komentar) {
									// Komentar yang sudah dibuat, ditaruh di pmateri sesuai dengan id_topik
									topik.komentar
										.push(komentar._id)
											
									topik
										.save(function(err, topik) {
											// Jika gagal menyimpan komentar ke materi, maka hapus komentar yang sudah dibuat
											if (err) {
												Komentar
													.findByIdAndRemove(komentar._id)
													.then(function(komentar) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Menghapus komentar berhasil.', err: err});
													})
													.catch(function(err) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Menghapus komentar gagal.', err: err});
													})
											} else {
												res.status(200).json({status: true, message: 'Membuat komentar baru berhasil.', data: komentar});
											}
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

			if (id == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
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
									Post
										.find()
										.where('komentar._id').equals(id)
										.exec(function(err, post) {
											if (post == null || post == 0) {
												res.status(204).json({status: false, message: 'Artikel tidak ditemukan'})
											}
										})
									post.komentar
										.remove(id)

									post
										.save(function(err, post) {
											// Jika gagal menyimpan komentar ke post, maka hapus komentar yang sudah dibuat
											if (err) {
												Komentar
													.create(komentar)
													.then(function(komentar) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Membuat kembali komentar berhasil.', err: err});
													})
													.catch(function(err) {
														res.status(500).json({status: false, message: 'Menyimpan komentar gagal. Membuat kembali komentar gagal.', err: err});
													})
											} else {
												res.status(200).json({status: true, message: 'Komentar berhasil dihapus.', data: komentar});
											}
										})
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

	this.suka = function(req, res) {
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

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Komentar
					.findById(id)
					.then(function(komentar) {
						if (komentar == null || komentar == 0) {
							res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
						} else {
							komentar
								.suka.create({
									penyuka: penyuka
								})
								.then(function(komentar) {
									res.status(200).json({status: true, message: 'Suka komentar berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Suka komentar gagal.', err: err});
								}) 
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					});
			}
		}
	}
}

module.exports = new KomentarControllers();