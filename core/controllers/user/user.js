// package yang diperlukan
var jwt = require('jsonwebtoken');
var moment = require('moment');
var crypto = require('crypto');
var secret = require('./../../configurations/settings/jwt').secret;

var connectionPengguna = require('./../../configurations/connectionPengguna');

var UserSchema = require('./../../models/pengguna/user');

var User = connectionPengguna.model('User', UserSchema);

// definisikan fungsi untuk membuat token sebagai async/await
async function createToken(user, login_type, remember_me) {
	try {
		let kadaluarsa;

		if (remember_me == true) {
			// jika remember_me true, maka kadaluarsa 30 hari
			kadaluarsa = 30 * 24 * 60 * 60;
		} else {
			// jika remember_me false, maka kadaluarsa 1 jam
			kadaluarsa = 60 * 60
		}

		let token = await jwt.sign({
			user: user,
			login_type: login_type,
			remember_me: remember_me,
		}, secret ,{
			expiresIn: kadaluarsa
		})

		res.status(200).json({status: true, message: 'User terotentikasi dan terotorisasi.', data: user, token: token});
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
		let auth = true;

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi dan otorisasi gagal.'});
		} else {
			let option = JSON.parse(req.params.option);
			let skip = Number(option.skip);
			let limit = Number(option.limit);
			let status = option.status;
			let role = option.role;

			if (!(skip && limit)) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				User
					.find()
					.where('status').equals(status)
					.select({
						password: -1
					})
					.skip(skip)
					.limit(limit)
					.exec(function(err, user) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
						} else if (!user || user == 0) {
							res.status(204).json({status: false, message: 'User tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user});
						}
					});
			}
		}
	}

	this.get = function(req, res) {
		let auth = true;

		if (auth = false) {

		} else {

		}

	}

	// Tambah user
	this.add = function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let email = req.body.email;


		if (username && password && email && name) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			User
				.find()
				.or([{
					username: username
				}, {
					email: email
				}])
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({status: false, message: 'Cek user sudah ada gagal.', err: err});
					} else if(user || user != 0) {
						res.status(400).json({status: false, message: 'Pengguna dengan username atau email tersebut sudah ada. Silahkan login.'});
					} else {	
						password = hashPassword(password);
						
						User
							.create({
								username: username,
								password: password,
								email: email,
								nama: nama
							})
							.then(function(user) {
								res.status(200).json({status: true, message: 'Tambah user baru berhasil.'});
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Tambah user baru gagal.', err: err});
							})
					}
				});
		}
	}

	this.login = function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let login_type = req.body.login_type;
		let remember_me = req.body.remember_me;
		
		if(!login_type) {
      		res.status(500).json({ status:500,success: false, message: 'Asal device tidak diketahui'});
  		} else {
      		password =hashPassword(password);
      		// find the user
      		User
      			.findOne()
      			.where('username').equals(username)
      			.where('password').equals(password)
      			.select({
      				password: -1
      			})
      			.exec(function(err, user) {
      				if (err) {
      					res.status(500).json({status: false, message: 'User gagal ditemukan.', err: err})
      				} else if (!user && user == 0) {
            			res.status(204).json({status: false, message: 'Otentikasi gagal. Username atau password salah.' });
          			} else {
          				// panggil fungsi membuat token
          				createToken(user, login_type, remember_me);
          			}
          		});
       	}
	}

	this.authByRole = function(req, res) {
		let token = req.body.token;
		let role = req.body.role;

		jwt.verify(token, secret, function(err, decoded) {
			if (err) {
				res.status(401).json({status: false, message: 'User tidak terotentikasi', err: err});
			} else if (!role.includes(decoded.user.role)) {
				res.status(403).json({status: false, message: 'User tidak memiliki hak akses ke resource'})
			} else {
				createToken(decoded.user, decoded.login_type, decoded.remember_me);
			}
		});
	}
}

module.exports = new UserControllers();