var mongoose = require('mongoose');
var fetch = require('node-fetch');

var Auth = require('./../../auth');

var configuration = require('./../../configuration');

// koneksi database yang dibutuhkan
var connection = require('./../../connection');

var ProfilSchema = require('./../../models/user/profil');

var Profil = connection.model('Profil', ProfilSchema);

async function cekProfil(user) {
	if (user == null) {
		throw new Error('Ada parameter yang kosong');
	} else {
		try {
			let profil = await Profil.find().where('user').equals(user).exec();
			if (profil != null && profil != 0) {
				return profil;
			} else {
				return await Profil.create({user: user})
			}
		} catch (err) {
			throw new Error('Gagal ambil profil.');
		}

	}
}

function ProfilControllers() {
	this.isSayaIkuti = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		let user = req.params.user;

		if (user == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![3, 4, 5, 6].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let pengikut = auth.data._id;
			
			Profil
				.findOne()
				.where('user').equals(user)
				.exec(function(err, profil) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
					} else if (profil == null || profil == 0) {
						res.status(204).json({status: false, message: 'Profil tidak ditemukan.'});
					} else {
						Profil
							.findOne()
							.where('user').equals(user)
							.where('pengikut').in([pengikut])
							.exec(function(err, ikuti) {
								console.log(profil)
								if (err) {
									res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
								} else if (ikuti == null || ikuti == 0) {
									res.status(200).json({status: true, message: 'Ambil flag saya ikuti berhasil', data: false});
								} else {
									res.status(200).json({status: true, message: 'Ambil flag saya ikuti berhasil', data: true});
								}
							})
					}
				})
		}

	}

	this.ubah = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}
		
		let user = req.body.user;

		if (user == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth == false || auth.status == false || (![3, 4, 5, 6].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else if (auth.data._id == user) {
			res.status(400).json({status: false, message: 'Tidak dapat mengikuti diri sendiri.'});
		} else {
			let pengikut = auth.data._id;
			
			await cekProfil(user);
			
			Profil
				.findOne()
				.where('user').equals(user)
				.exec(function(err, profil) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
					} else if (profil == null || profil == 0) {
						res.status(204).json({status: false, message: 'Profil tidak ditemukan.'});
					} else {
						Profil
							.findOne()
							.where('user').equals(user)
							.where('pengikut').in([pengikut])
							.exec(function(err, ikuti) {
								console.log(profil)
								if (err) {
									res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
								} else if (ikuti == null || ikuti == 0) {
									profil.pengikut
										.push(pengikut)
	
									profil
										.save(function(err, profil) {
											if (err) {
												res.status(500).json({status: false, message: 'Simpan ikuti pengguna gagal.', err: err});
											} else {
												res.status(200).json({status: true, message: 'Ikuti pengguna berhasil.', data: profil});
											}
										})
								} else {
									profil.pengikut
										.pull(pengikut)

									profil
										.save(function(err, profil) {
											if (err) {
												res.status(500).json({status: false, message: 'Simpan batal ikuti pengguna gagal.', err: err});
											} else {
												res.status(200).json({status: true, message: 'Batal ikuti pengguna berhasil.', data: profil});
											}
										})
								}
							})
					}
				})
		}
	}
}

module.exports = new ProfilControllers();