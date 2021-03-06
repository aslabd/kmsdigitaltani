var mongoose = require('mongoose');
var fetch = require('node-fetch');

var Auth = require('./../../auth');

var connection = require('./../../connection');

// konfigurasi lainnya
var configuration = require('./../../configuration');

var PostSchema = require('./../../models/artikel/post');
var TanyaSchema = require('./../../models/diskusi/tanya');
var TopikSchema = require('./../../models/materi/topik');
var KomentarSchema = require('./../../models/tanggapan/komentar');

var Post = connection.model('Post', PostSchema);
var Tanya = connection.model('Tanya', TanyaSchema);
var Topik = connection.model('Topik', TopikSchema);
var Komentar = connection.model('Komentar', KomentarSchema);

async function getMetaForKomentars(req, komentars, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	for (let item of komentars) {
		try {
			let meta = await fetch(configuration.host + '/meta/meta/komentar/' + item._id, options);
			let meta_json = await meta.json();
			item.meta = Object.assign(item.meta, meta_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta komentar gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil komentar berhasil.', data: komentars});
}

async function getMetaForKomentar(req, komentar, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	try {
		let meta = await fetch(configuration.host + '/meta/meta/artikel/' + komentar._id, options);
		let meta_json = await meta.json();
		komentar.meta = Object.assign(komentar.meta, meta_json.data);
		res.status(200).json({status: true, message: 'Ambil komentar berhasil.', data: komentar});
	} catch (err) {
		console.log(err)
		res.status(500).json({status: false, message: 'Ambil meta komentar gagal.', err: err});
	}
}

function KomentarControllers() {
	// Ambil semua komentar (sebagian atribut) di dalam suatu post
	this.getAllFromPost = function(req, res) {
		let id_post = req.params.id_post;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_post == null || skip == null || limit == null) {
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
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else if (post.komentar == null || post.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentars(req, post.komentar, res);
					}
				});
		}
	}

	this.getAllFromTanya = function(req, res) {
		let id_tanya = req.params.id_tanya;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_tanya == null || skip == null || limit == null) {
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
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else if (tanya.komentar == null || tanya.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentars(req, tanya.komentar, res);
					}
				});
		}
	}

	this.getAllFromTopik = function(req, res) {
		let id_topik = req.params.id_topik;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_topik == null || skip == null || limit == null) {
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
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else if (topik.komentar == null || topik.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentars(req, topik.komentar, res);
					}
				});
		}
	}

	this.countFromPost = function(req, res) {
		let id_post = mongoose.Types.ObjectId(req.params.id_post);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		if (id_post== null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Post
				.aggregate([{
					$match: {
						_id: id_post
					}
				}, {
					$unwind: '$komentar'	// pecah data untuk setiap komentar
				}, {
					$lookup: {
						from: 'komentars',	// menggunakan nama collection pada database
						localField: 'komentar',
						foreignField: '_id',
						as: 'komentar'
					}
				}, {
					$match: {
						'komentar.status': 'terbit'
					}
				}, {
					$group: {
						_id: '$_id',
						jumlah_komentar: {
							$sum: 1
						}
					}
				}])
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil jumlah komentar di suatu artikel gagal.', err: err});
					} else {
						res.status(200).json({status: true, message: 'Ambil jumlah komentar di suatu artikel berhasil.', data: komentar})
					}
				});
		}
	}

	this.countFromTanya = function(req, res) {
		let id_tanya = mongoose.Types.ObjectId(req.params.id_tanya);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		if (id_tanya == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Tanya
				.aggregate([{
					$match: {
						_id: id_tanya
					}
				}, {
					$unwind: '$komentar'	// pecah data untuk setiap komentar
				}, {
					$lookup: {
						from: 'komentars',	// menggunakan nama collection pada database
						localField: 'komentar',
						foreignField: '_id',
						as: 'komentar'
					}
				}, {
					$match: {
						'komentar.status': 'terbit'
					}
				}, {
					$group: {
						_id: '$_id',
						jumlah_komentar: {
							$sum: 1
						}
					}
				}])
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil jumlah komentar di suatu pertanyaan gagal.', err: err});
					} else {
						res.status(200).json({status: true, message: 'Ambil jumlah komentar di suatu pertanyaan berhasil.', data: komentar})
					}
				});
		}
	}

	this.countFromTopik = function(req, res) {
		let id_topik = mongoose.Types.ObjectId(req.params.id_topik);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		if (id_topik == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Topik
				.aggregate([{
					$match: {
						_id: id_topik
					}
				}, {
					$unwind: '$komentar'	// pecah data untuk setiap komentar
				}, {
					$lookup: {
						from: 'komentars',	// menggunakan nama collection pada database
						localField: 'komentar',
						foreignField: '_id',
						as: 'komentar'
					}
				}, {
					$match: {
						'komentar.status': 'terbit'
					}
				}, {
					$group: {
						_id: '$_id',
						jumlah_komentar: {
							$sum: 1
						}
					}
				}])
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil jumlah komentar di suatu materi gagal.', err: err});
					} else {
						res.status(200).json({status: true, message: 'Ambil jumlah komentar di suatu materi berhasil.', data: komentar})
					}
				});
		}
	}

	// Ambil satu komentar (lengkap) dalam suatu post
	this.get = function(req, res) {
		let id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Komentar
				.findById(id)
				.select({
					balasan: 0
				})
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (komentar == null || komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentar(req, komentar, res);
					}
				});
		}
	}

	// Tambah komentar di Artikel
	this.addToPost = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let id_post = req.body.id_post;
		let isi = req.body.isi;

		if (id_post == null || isi == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Post
				.findById(id_post)
				.then(function(post) {
					if (post == null || post == 0 || post.status == 'hapus') {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						Komentar
							.create({
								penulis: penulis,
								isi: isi
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
				});
		}
	}

	// Tambah komentar ke Diskusi
	this.addToTanya = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let id_tanya = req.body.id_tanya;
		let isi = req.body.isi;

		if (id_tanya == null || isi == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Tanya
				.findById(id_tanya)
				.then(function(tanya) {
					if (tanya == null || tanya == 0 || tanya.status == 'hapus') {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else {
						Komentar
							.create({
								penulis: penulis,
								isi: isi
							})
							.then(function(komentar) {
								// Komentar yang sudah dibuat, ditaruh di post sesuai dengan id_tanya
								tanya.komentar
									.push(komentar._id)
										
								tanya
									.save(function(err, tanya) {
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
					res.status(500).json({status: false, message: 'Pertanyaan gagal ditemukan.', err: err});
				});
		}
	}

	// Tambah komentar ke Materi
	this.addToTopik = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let id_topik = req.body.id_topik;
		let isi = req.body.isi;

		if (id_topik == null || isi == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Topik
				.findById(id_topik)
				.then(function(topik) {
					if (topik == null || topik == 0 || topik.status == 'hapus') {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else {
						Komentar
							.create({
								penulis: penulis,
								isi: isi
							})
							.then(function(komentar) {
								// Komentar yang sudah dibuat, ditaruh di post sesuai dengan id_post
								topik.komentar
									.push(komentar._id)
										
								topik
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
					res.status(500).json({status: false, message: 'Materi gagal ditemukan.', err: err});
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
		} else if (auth == false || auth.status == false || (![2, 3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;
			Komentar
				.findById(id)
				.select('penulis')
				.then(function(komentar) {
					if (komentar == null || komentar == 0 || komentar.status == 'hapus') {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else if ((komentar.penulis != penulis) && (![1].includes(auth.data.role))) {
						res.status(403).json({status: false, message: 'Anda bukan penulis komentar ini atau tidak berhak melakukan ini.'});
					} else {
						Komentar
							.findByIdAndUpdate(id, {
								status: 'hapus',
								'tanggal.hapus': Date.now()
							})
							.then(function(komentar) {
								res.status(200).json({status: true, message: 'Komentar berhasil dihapus.'});
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

module.exports = new KomentarControllers();