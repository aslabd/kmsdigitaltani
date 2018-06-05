var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fetch = require('node-fetch');

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

async function getMetaForKomentar(komentar, res) {
	try {
		let balasan = await fetch(configuration.host + '/tanggapan/balasan/' + komentar._id + '/jumlah');
		let suka = await fetch(configuration.host + '/tanggapan/suka/komentar/' + komentar._id + '/jumlah');
		let balasan_json = await balasan.json();
		let suka_json = await suka.json();

		if (balasan_json.data[0] == null) {
			komentar.meta.jumlah.balasan = 0;
		} else {
			komentar.meta.jumlah.balasan = balasan_json.data[0].jumlah_balasan;
		}
		if (suka_json.data[0] == null) {
			komentar.meta.jumlah.suka = 0;
		} else {
			komentar.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
		}
		res.status(200).json({status: true, message: 'Ambil suatu komentar berhasil.', data: komentar});
	} catch (err) {
		console.log(err)
		res.status(500).json({status: false, message: 'Ambil meta komentar gagal.', err: err});
	}
}

async function getMetaForKomentars(komentars, res) {
	for (let item of komentars) {
		try {
			let balasan = await fetch(configuration.host + '/tanggapan/balasan/' + item._id + '/jumlah');
			let suka = await fetch(configuration.host + '/tanggapan/suka/komentar/' + item._id + '/jumlah');			
			let balasan_json = await balasan.json();
			let suka_json = await suka.json();

			if (balasan_json.data[0] == null) {
				item.meta.jumlah.balasan = 0;
			} else {
				item.meta.jumlah.balasan = balasan_json.data[0].jumlah_balasan;
			}
			if (suka_json.data[0] == null) {
				item.meta.jumlah.suka = 0;
			} else {
				item.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
			}
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta komentar gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil komentar berhasil.', data: komentars});
}

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
					} else if (post == null || post == 0) {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else if (post.komentar == null || post.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentars(post.komentar, res);
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
					} else if (tanya == null || tanya == 0) {
						res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
					} else if (tanya.komentar == null || tanya.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentars(tanya.komentar, res);
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
					} else if (topik == null || topik == 0) {
						res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
					} else if (topik.komentar == null || topik.komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						getMetaForKomentars(topik.komentar, res);
					}
				});
		}
	}

	this.countFromPost = function(req, res) {
		let id_post = mongoose.Types.ObjectId(req.params.id_post);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

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

	this.countFromTanya = function(req, res) {
		let id_tanya = mongoose.Types.ObjectId(req.params.id_tanya);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

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

	this.countFromTopik = function(req, res) {
		let id_topik = mongoose.Types.ObjectId(req.params.id_topik);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

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
						getMetaForKomentar(komentar, res);
					}
				});
		}
	}

	// Tambah komentar di Artikel
	this.addToPost = function(req, res) {
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id_post = req.body.id_post;
			let isi = req.body.isi;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_post == null || penulis ==  null || isi == null) {
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
					})
			}
		}
	}

	// Tambah komentar ke Diskusi
	this.addToTanya = function(req, res) {
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id_tanya = req.body.id_tanya;
			let isi = req.body.isi;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_tanya == null || penulis ==  null || isi == null) {
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
									isi: isi
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
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id_topik = req.body.id_topik;
			let isi = req.body.isi;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_topik == null || penulis ==  null || isi == null) {
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
									isi: isi
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
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
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
						} else {
							Komentar
								.findByIdAndUpdate(id, {
									status: 'hapus'
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
}

module.exports = new KomentarControllers();