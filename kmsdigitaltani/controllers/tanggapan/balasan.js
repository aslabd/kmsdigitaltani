var jwt =require('jsonwebtoken');

var connection = require('./../../connection');

var KomentarSchema = require('./../../models/tanggapan/komentar');
var BalasanSchema = require('./../../models/tanggapan/balasan');

var Komentar = connection.model('Komentar', KomentarSchema);
var Balasan = connection.model('Balasan', BalasanSchema);

function BalasanControllers() {
	// Ambil semua balasan (sebagian atribut) di dalam suatu komentar
	this.getAll = function(req, res) {
		var id_komentar = req.params.id_komentar;

		if (id_komentar == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			Komentar
				.findById(id_komentar)
				.select({
					balasan: 1
				})
				.populate('balasan')
				.exec(function(err, komentar) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					} else if (komentar == null || komentar == 0) {
						res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Komentar berhasil ditemukan.', data: komentar.balasan})
					}
				});
		}
	}

	// Tambah balasan
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
			let id_komentar = req.body.id_komentar;
			let isi = req.body.isi;
			let status = req.body.status;

			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penulis = decoded._id;

			if (id_komentar == null || penulis ==  null || isi == null || status == null) {
				res.status(400).json({status: false, message: 'Ada parameter wajib yang kosong.'});
			} else {
				Komentar
					.findById(id_komentar)
					.then(function(komentar) {
						if (komentar == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Balasan
								.create({
									penulis: penulis,
									isi: isi,
									status: status
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
						} else if (auth.role !== 'admin' || balasan.penulis !== penulis) {
							res.status(401).json({status: false, message: 'Otorisasi salah.'})
						} else {
							Balasan
								.findByIdAndRemove(id)
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
				Balasan
					.findById(id)
					.then(function(balasan) {
						if (balasan == null || balasan == 0) {
							res.status(204).json({status: false, message: 'Balasan tidak ditemukan.'});
						} else {
							balasan
								.suka.create({
									penyuka: penyuka
								})
								.then(function(balasan) {
									res.status(200).json({status: true, message: 'Suka balasan berhasil.'});
								})
								.catch(function(err) {
									res.status(500).json({status: false, message: 'Suka balasan gagal.', err: err});
								}) 
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