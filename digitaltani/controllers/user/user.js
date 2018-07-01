// package yang diperlukan
var jwt = require('jsonwebtoken');
var moment = require('moment');
var crypto = require('crypto');

// ambil file lain yang dibutuhkan
var authorization = require('./../../auth');
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
			// jika remember_me true, maka kadaluarsa 30 hari
			kadaluarsa = 30 * 24 * 60 * 60;
		} else {
			// jika remember_me false, maka kadaluarsa 0.5 jam
			kadaluarsa = 30 * 60
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

function generateRandomString() {
	let random = '';
	let karakter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 10; i++) {
		random += karakter.charAt(Math.floor(Math.random() * possible.length));
	}
	return random;
}

// definisikan fungsi untuk membuat token sebagai async/await
async function createTokenForVerify(user, secret, res) {
	try {
		let kadaluarsa = 30 * 60

		let token = await jwt.sign({
			user: user
		}, secret ,{
			expiresIn: kadaluarsa
		})
		
		return token;
	} catch (err) {
		return new Error(err);
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
		} else if (auth == false) {
			User
				.find()
				.where('status').equals(status)
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
						res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user});
					}
				});
		} else {
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
						res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user});
					}
				});
		}
	}

	// Ambil semua user
	this.getAllByRole = function(req, res) {
		let auth = authorization.verify(req);

		let option = JSON.parse(req.params.option);
		let skip = Number(option.skip);
		let limit = Number(option.limit);
		let status = option.status;
		let role = option.role;

		if (skip == null || limit == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (auth) {
			User
				.find()
				.where('status').equals(status)
				.select({
					password: 0
				})
				.skip(skip)
				.limit(limit)
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
					} else if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'User tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user});
					}
				});
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
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
					} else if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'User tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user});
					}
				});
		}
	}

	this.get = function(req, res) {
		let id = req.params.id;

		let auth = authorization.verify(req);

		if (auth) {
			User
				.findById(id)
				.select({
					password: 0
				})
				.then(function(user) {
					if (user == null || user == 0) {
						res.status(204).json({status: false, message: 'Pengguna tidak ditemukan.'});
					} else {
						res.status(200).json({status: true, message: 'Pengguna berhasil ditemukan.', data: user});
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
						res.status(200).json({status: true, message: 'Pengguna berhasil ditemukan.', data: user});
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
		let email = req.body.email;
		let nama = req.body.nama;
		let role = req.body.role;

		if (username == null || password == null || email == null || nama == null || role == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
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
										await mail.getVerifyEmail(user, token)
										res.status(200).json({status: true, message: 'Tambah user baru berhasil.'});
									} catch (err) {
										res.status(500).json({status: false, message: 'Gagal kirim email.', err: err});
									}
								})
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

	this.updateAddressEmail = function(req, res) {

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
		
		if(!login_type) {
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
					foto: 1
				})
      			.exec(function(err, user) {
      				if (err) {
      					res.status(500).json({status: false, message: 'Pengguna gagal ditemukan.', err: err})
      				} else if (!user && user == 0) {
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

	this.getLupaPassword = function(req, res) {
		let email = req.body.email;

		if (username == null && email == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			User
				.findOne()
				.where('email.address').equals(email)
				.where('status').equals(true)
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil pengguna gagal.', err: err});
					} else if (user == null || user == 0) {
						res.status(204).json({status: false, message:, 'Pengguna tidak ditemukan.'});
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