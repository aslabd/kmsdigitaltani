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

async function getMetaForProfils(req, profils, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	for (let item of profils) {
		try {
			let meta = await fetch(configuration.host + '/meta/meta/profil/' + item._id, options);
			let meta_json = await meta.json();
			item.meta = Object.assign(item.meta, meta_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil meta profil gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil profil berhasil.', data: users});
}

async function getMetaForProfil(req, profil, res) {
	let options = {};
	let authorization = req.headers.authorization;

	if (authorization != null) {
		options.headers = {
			'Authorization': req.headers.authorization
		}
	}

	try {
		let meta = await fetch(configuration.host + '/meta/meta/profil/' + profil.user, options);
		let meta_json = await meta.json();
		profil.meta = Object.assign(profil.meta, meta_json.data);
		res.status(200).json({status: true, message: 'Ambil profil berhasil.', data: profil});
	} catch (err) {
		res.status(500).json({status: false, message: 'Ambil meta profil gagal.', err: err});
	}
}

async function getInfoPenggunaPengikut(pengikuts, res) {
	let users = [];

	for (let item of pengikuts) {
		try {
			let user = await fetch(configuration.url.digitaltani + '/user/' + item);
			let user_json = await user.json();
			users.push(user_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil info pengikut gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil pengikut berhasil.', data: users});
}

async function getInfoPenggunaMengikuti(profils, res) {
	let users = [];


	for (let item of profils) {
		try {
			let user = await fetch(configuration.url.digitaltani + '/user/' + item.user);
			let user_json = await user.json();
			users.push(user_json.data);
		} catch (err) {
			break;
			res.status(500).json({status: false, message: 'Ambil info ikuti gagal.', err: err});
		}
	}
	res.status(200).json({status: true, message: 'Ambil ikuti berhasil.', data: users});
}

function ProfilControllers() {
	this.getAllBySayaMengikuti = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		if (auth == false || auth.status == false || (![3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let pengikut = auth.data._id;

			Profil
				.find()
				.where('pengikut').equals([pengikut])
				.select('user')
				.exec(function(err, profil) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil profil pengguna gagal.', err: err});
					} else if (profil == null || profil == 0) {
						res.status(204).json({status: false, message: 'Profil pengguna tidak ditemukan.'})
					} else {
						getInfoPenggunaMengikuti(profil, res)
						// res.status(200).json({status: true, message: 'Ambil profil pengguna berhasil.', data: profil})
					}
				})
		}
	}

	this.getAllBySayaPengikut = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		if (auth == false || auth.status == false || (![3, 4, 5, 6, 7].includes(auth.data.role))) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			let user = auth.data._id;
			
			await cekProfil(user);

			Profil
				.findOne()
				.where('user').equals(user)
				.exec(function(err, profil) {
					if (err) {
						res.status(500).json({status: true, message: 'Ambil profil gagal.', err: err});
					} else if (profil == null || profil == 0) {
						res.status(204).json({status: true, message: 'Profil tidak ditemukan..'});
					} else {
						getInfoPenggunaPengikut(profil.pengikut, res);
					}
				});
		}
	}
	
	this.getByUser = async function(req, res) {
		let user = req.params.user;

		if (user == null) {
			res.status(400).json({status: true, message: 'Ada parameter yang kosong.'});
		} else {
			await cekProfil(user);
			
			Profil
				.findOne()
				.where('user').equals(user)
				.exec(function(err, profil) {
					if (err) {
						res.status(500).json({status: true, message: 'Ambil profil gagal.', err: err});
					} else if (profil == null || profil == 0) {
						res.status(204).json({status: true, message: 'Profil tidak ditemukan..'});
					} else {
						getMetaForProfil(req, profil, res);
					}
				});
		}

	}

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