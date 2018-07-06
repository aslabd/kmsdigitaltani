var mongoose = require('mongoose');

var Auth = require('./../../auth');

var connection = require('./../../connection');

var KomentarSchema = require('./../../models/tanggapan/komentar');
var BalasanSchema = require('./../../models/tanggapan/balasan');

var Komentar = connection.model('Komentar', KomentarSchema);
var Balasan = connection.model('Balasan', BalasanSchema);

async function getMetaForBalasans(req, balasans, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	for (let item of balasans) {
		try {
			let meta = await fetch(configuration.host + '/meta/meta/artikel/' + item._id, options);
			let meta_json = await meta.json();
			item.meta = Object.assign(item.meta, meta_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta balasan gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil balasan berhasil.', data: balasans});
}

function BalasanControllers() {
	// Ambil semua balasan (sebagian atribut) di dalam suatu komentar
	this.getAllFromKomentar = function(req, res) {
		let id_komentar = req.params.id_komentar;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_komentar == null || skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Komentar
				.findById(id_komentar)
				.populate({
					path: 'balasan',
					match: {
						status: {
							$eq: 'terbit'
						}
					},
					skip: skip,
					limit: limit
				})
				.select({
					balasan: 1
				})
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (komentar == null || komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else if (komentar.balasan == null || komentar.balasan == 0) {
						res.status(204).json({status: false, message: 'Balasan tidak ditemukan.'});
					} else {
						getMetaForBalasans(req, komentar.balasan, res);
					}
				});
		}
	}

	this.countFromKomentar = function(req, res) {
		let id_komentar = mongoose.Types.ObjectId(req.params.id_komentar);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		if (id_komentar == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Komentar
				.aggregate([{
					$match: {
						_id: id_komentar
					}
				}, {
					$unwind: '$balasan'	// pecah data untuk setiap komentar
				}, {
					$lookup: {
						from: 'balasans',	// menggunakan nama collection pada database
						localField: 'balasan',
						foreignField: '_id',
						as: 'balasan'
					}
				}, {
					$match: {
						'balasan.status': 'terbit'
					}
				}, {
					$group: {
						_id: '$_id',
						jumlah_balasan: {
							$sum: 1
						}
					}
				}])
				.exec(function(err, balasan) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil jumlah balasan di suatu komentar gagal.', err: err});
					} else {
						res.status(200).json({status: true, message: 'Ambil jumlah balasan di suatu komentar berhasil.', data: balasan});
					}
				});
		}
	}

	// Tambah balasan
	this.add = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let id_komentar = req.body.id_komentar;
		let isi = req.body.isi;

		if (id_komentar == null || isi == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![2, 3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Komentar
				.findById(id_komentar)
				.then(function(komentar) {
					if (komentar == null || komentar == 0 || komentar.status == 'hapus') {
						res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
					} else {
						Balasan
							.create({
								penulis: penulis,
								isi: isi
							})
							.then(function(balasan) {
								// Balasan yang sudah dibuat, ditaruh di komentar yang sesuai dengan id_komentar
								Komentar
									.findById(id_komentar)
									.then(function(komentar) {
										komentar.balasan
											.push(balasan._id)
												
										komentar
											.save(function(err) {
												// Jika gagal menyimpan balasan ke komentar, maka hapus balasan yang sudah dibuat
												if (err) {
													Balasan
														.findByIdAndRemove(balasan._id)
														.then(function(balasan) {
															res.status(500).json({status: false, message: 'Menyimpan balasan gagal. Balasan berhasil dihapus.', err: err});
														})
														.catch(function(err) {
															res.status(500).json({status: false, message: 'Menyimpan balasan gagal. Hapus balasan gagal.', err: err});
														})
												} else {
													res.status(200).json({status: true, message: 'Membuat balasan baru berhasil.'});
												}
											})
									})
									.catch(function(err) {
										res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
									})
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Membuat balasan baru gagal.', err: err});
							})
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Komentar gagal ditemukan.', err: err});
				})
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
		} else if (auth == false || auth.status == false || (![1, 2, 3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let penulis = auth.data._id;

			Balasan
				.findById(id)
				.select('penulis')
				.then(function(balasan) {
					if (balasan == null || balasan == 0 || balasan.status == 'hapus') {
						res.status(204).json({status: false, message: 'Balasan tidak ditemukan.'});
					} else if ((balasan.penulis != penulis) && (![1].includes(auth.data.role))) {
						res.status(403).json({status: false, message: 'Anda bukan penulis balasan ini atau tidak berhak melakukan ini.'});
					} else {
						Balasan
							.findByIdAndUpdate(id, {
								status: 'hapus',
								'tanggal.hapus': Date.now()
							})
							.then(function(balasan) {
								res.status(200).json({status: true, message: 'Hapus balasan berhasil.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Hapus balasan gagal.', err: err});
							});
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil balasan gagal.', err: err});
				});
		}	
	}
}

module.exports = new BalasanControllers();