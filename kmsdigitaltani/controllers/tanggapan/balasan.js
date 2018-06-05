var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var connection = require('./../../connection');

var KomentarSchema = require('./../../models/tanggapan/komentar');
var BalasanSchema = require('./../../models/tanggapan/balasan');

var Komentar = connection.model('Komentar', KomentarSchema);
var Balasan = connection.model('Balasan', BalasanSchema);

async function getMetaForBalasans(balasans, res) {
	for (let item of balasans) {
		try {
			let suka = await fetch(configuration.host + '/tanggapan/suka/balasan/' + item._id + '/jumlah');			
			let suka_json = await suka.json();

			if (suka_json.data[0] == null) {
				item.meta.jumlah.suka = 0;
			} else {
				item.meta.jumlah.suka = suka_json.data[0].jumlah_suka;
			}
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta balasan gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil balasan berhasil.', data: komentars});
}

function BalasanControllers() {
	// Ambil semua balasan (sebagian atribut) di dalam suatu komentar
	this.getAllFromKomentar = function(req, res) {
		let id_komentar = req.params.id_komentar;
		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);

		if (id_komentar == null) {
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
						getMetaForBalasans(komentar.balasan, res);
					}
				});
		}
	}

	this.countFromKomentar = function(req, res) {
		let id_komentar = mongoose.Types.ObjectId(req.params.id_komentar);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

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

	// Tambah balasan
	this.add = function(req, res) {
		var auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id_komentar = req.body.id_komentar;
			let isi = req.body.isi;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_komentar == null || penulis ==  null || isi == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Komentar
					.findById(id_komentar)
					.then(function(komentar) {
						if (komentar == null || komentar == 0) {
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
	}

	// this.update = function(req, res) {
	// 	let auth = true;

	// 	if (auth == false) {
	// 		res.status(401).json({status: false, message: 'Otentikasi gagal.'});
	// 	} else {
	// 		let id = req.body.id;
	// 		let isi = req.body.isi;

	// 		Balasan
	// 			.findById(id)
	// 			.then(function())
	// 	}
	// }

	this.delete = function(req, res) {
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id = req.body.id;
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id == null || penulis == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Balasan
					.findById(id)
					.select('penulis')
					.then(function(balasan) {
						if (balasan == null || balasan == 0) {
							res.status(204).json({status: false, message: 'Balasan tidak ditemukan.'});
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
}

module.exports = new BalasanControllers();