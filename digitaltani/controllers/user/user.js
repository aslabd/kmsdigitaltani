// package yang diperlukan
var jwt = require('jsonwebtoken');
var moment = require('moment');
var crypto = require('crypto');

// untuk keperluan auth
var Auth = require('./../../auth');

// ambil file lain yang dibutuhkan
var configuration = require('./../../configuration');
var mail = require('./../mail/mail');

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkna
var UserSchema = require('./../../models/user/user');

// sinkronisasi dengan collection di database
var User = connection.model('User', UserSchema);

// definisikan fungsi untuk membuat token sebagai async/await
async function createToken(user, login_type, remember_me, res) {
	try {
		let kadaluarsa;

		if (remember_me == true) {
			// jika remember_me true, maka kadaluarsa 7 hari
			kadaluarsa = 7 * 24 * 60 * 60;
		} else {
			// jika remember_me false, maka kadaluarsa 1 jam
			kadaluarsa = 60 * 60
		}

		let token = await jwt.sign({
			user: user,
			login_type: login_type,
			remember_me: remember_me,
		}, configuration.jwt.secret ,{
			expiresIn: kadaluarsa
		})

		res.status(200).json({status: true, message: 'Otorisasi berhasil.', user: user, token: token});
	} catch (err) {
		res.status(500).json({status: false, message: 'Token gagal dibuat.', err: err});
	}
}

// fungsi untuk hash password
var hashPassword = function(password) {
	return crypto.createHash('sha256').update(password, 'utf8').digest('hex');
}

function UserControllers() {
	// Ambil semua user
	this.getAll = function(req, res) {
		let auth = authorization.verify(req);

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let status = option.status;

		let sort = JSON.parse(req.params.sort);
		if (sort = 'z-a') {
			sort = '-nama'
		} else {
			sort = 'nama'
		}

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth && auth.status && [1, 2].includes(auth.user.role)) {
			if (status != null) {
				User
					.find()
					.where('status').equals(status)
					.select({
						password: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort )
					.exec(function(err, user) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
						} else if (user == null || user == 0) {
							res.status(204).json({status: false, message: 'User tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user, token: auth.token});
						}
					});
			} else {
				User
					.find()
					.select({
						password: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort )
					.exec(function(err, user) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
						} else if (user == null || user == 0) {
							res.status(204).json({status: false, message: 'User tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user, token: auth.token});
						}
					});
			}
		} else {
			User
				.find()
				.where('status').equals(true)
				.select({
					username: 1,
					'email.address': 1,
					nama: 1,
					role: 1,
					foto: 1
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
					} else if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'User tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user, token: auth.token});
					}
				});
		}
	}

	// Ambil semua user
	this.getAllByRole = async function(req, res) {
		let auth = await Auth.verify(req);

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let status = option.status;
		let role = Number(option.role);

		let sort = req.params.sort;

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth && auth.status && [1, 2].includes(auth.user.role)) {						// hanya perbolehkan role 1 (admin) dan role 2 (pemerintah) yang lihat lengkap
			if (status != null) {
				User
					.find()
					.where('status').equals(status)
					.where('role').equals(role)
					.select({
						password: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort)
					.exec(function(err, user) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
						} else if (user == null || user == 0) {
							res.status(204).json({status: false, message: 'User tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user, token: auth.token});
						}
					});
			} else {
				User
					.find()
					.where('role').equals(role)
					.select({
						password: 0
					})
					.skip(skip)
					.limit(limit)
					.sort(sort)
					.exec(function(err, user) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
						} else if (user == null || user == 0) {
							res.status(204).json({status: false, message: 'User tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user, token: auth.token});
						}
					});
			}
		} else {
			User
				.find()
				.where('status').equals(status)
				.where('role').equals(role)
				.select({
					username: 1,
					'email.address': 1,
					nama: 1,
					role: 1,
					foto: 1
				})
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
					} else if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'User tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user, token: auth.token});
					}
				});
		}
	}

	this.get = async function(req, res) {
		let auth = await Auth.verify(req);

		let id = req.params.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth && auth.status && [1, 2].includes(auth.user.role)) {	// jika auth tidak bermasalah dan statusnya benar, serta role pengakses fungsi sesuai
			User
				.findById(id)
				.select({
					password: 0
				})
				.then(function(user) {
					if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'Pengguna tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Pengguna berhasil ditemukan.', data: user, token: auth.token});
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil pengguna gagal.', err: err});
				})
		} else {
			User
				.findById(id)
				.select({
					username: 1,
					'email.address': 1,
					nama: 1,
					role: 1,
					foto: 1
				})
				.then(function(user) {
					if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'Pengguna tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Pengguna berhasil ditemukan.', data: user, token: auth.token});
					}
				})
				.catch(function(err) {
					res.status(500).json({status: false, message: 'Ambil pengguna gagal.', err: err});
				})
		}
	}

	// Tambah user
	this.add = function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let confirm_password = req.body.confirm_password;
		let email = req.body.email;
		let nama = req.body.nama;
		let role = req.body.role;

		if (username == null || password == null || confirm_password == null || email == null || nama == null || role == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (confirm_password !== password) {
			res.status(400).json({status: false, message: 'Password berbeda dengan konfirmasi password.'});
		} else {
			User
				.find()
				.or([{
					username: username
				}, {
					'email.address': email
				}])
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Buat user baru gagal.', err: err});
					} else if(user == null || user == 0) {
						password = hashPassword(password);
						
						let token_verify = createTokenForVerify(data, secret, )
						User
							.create({
								username: username,
								password: password,
								'email.address': email,
								nama: nama,
								role: role
							})
							.then(function(user) {
								(async () => {
									try {
										// await getVerifyEmailAddress(user)
										res.status(200).json({status: true, message: 'Tambah user baru berhasil.'});
									} catch (err) {
										res.status(500).json({status: false, message: 'Gagal kirim email.', err: err});
									}
								})();
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Tambah user baru gagal.', err: err});
							})
					} else {	
						res.status(400).json({status: false, message: 'Pengguna dengan username atau email tersebut sudah ada. Silahkan login.'});
					}
				});
		}
	}

	this.updateNomorTelepon = function(req, res) {
		
	}

	this.updateAddressEmail = async function(req, res) {
		// let auth = await Auth.verify(req);
		// let id = req.body.id;
		// let email = req.body.email;

		// if (id == null || email == null) {
		// 	res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		// } else if (auth.status == false)

	}

	this.updateUsername = function(req, res) {

	}

	this.updateFoto = function(req, res) {

	}

	this.login = function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let login_type = req.body.login_type;
		let remember_me = req.body.remember_me;
		
		if(login_type == null) {
      		res.status(500).json({ status:500,success: false, message: 'Asal device tidak diketahui'});
  		} else {
      		password = hashPassword(password);
      		// Cari user dengan username dan password
      		User
      			.findOne()
      			.where('username').equals(username)
      			.where('password').equals(password)
      			.where('status').equals(true)
      			.select({
					username: 1,
					'email.address': 1,
					nama: 1,
					role: 1,
					foto: 1,
					status: 1
				})
      			.exec(function(err, user) {
      				if (err) {
      					res.status(500).json({status: false, message: 'Pengguna gagal ditemukan.', err: err})
      				} else if (user == null || user == 0) {
            			res.status(204).json({status: false, message: 'Pengguna tidak ditemukan. Username atau password salah.'});
          			} else {
          				// panggil fungsi membuat token
          				createToken(user, login_type, remember_me, res);
          			}
          		});
       	}
	}

	this.auth = function(req, res) {
		if (req.headers.authorization == null) {
			res.status(401).json({status: false, message: 'Otentikasi gagal. Silahkan login.'});
		} else {
			let token = req.headers.authorization.split(' ')[1];

			jwt.verify(token, configuration.jwt.secret, function(err, decoded) {
				if (err) {
					res.status(401).json({status: false, message: 'Token gagal diotentikasi. Silahkan login kembali.', err: err});
				} else {
					createToken(decoded.user, decoded.login_type, decoded.remember_me, res);
				}
			});
		}
	}

	this.getVerifyEmailAddress = function(req, res) {
		
	}

	this.getLupaPassword = function(req, res) {
		let email = req.body.email;

		if (email == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			User
				.findOne()
				.where('email.address').equals(email)
				.where('email.status').equals(true)
				.where('status').equals(true)
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil pengguna gagal.', err: err});
					} else if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'Pengguna tidak ditemukan.'});
					} else {
						let token = createToken(req, res);

						User
							.findByIdAndUpdate(user._id, {
								'lupa.status': true,
								'lupa.tanggal': Date.now(),
								'lupa.token': token 
							})
							.then(function(user) {
								(async () => {
									try {
										await mail.getLupaPassword(user, token);
										res.status(200).json({status: true, message: 'Permintaan ganti presiden berhasil. Silahkan cek email Anda.'});
									} catch (err) {
										res.status(500).json({status: false, message: 'Gagal mengirim email.', err: err});
									}
								})
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Ubah status pengguna gagal.', err: err});
							})
					}
				})
		}
	}
}

module.exports = new UserControllers();
