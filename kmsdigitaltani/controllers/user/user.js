// // koneksi ke database
// var connectionPH = require('./../../connectionPH');

// // skema yang dibutuhkan
// var UserSchema = require('./../../models/user/user');

// // aktifkan skema ke database
// var User = connectionPH.model('User', UserSchema);

// function UserControllers() {
// 	this.get = function(req, res) {
// 		let id = req.params.id;
		
// 		User
// 			.findById(id)
// 			.select({
// 				username: 1,
// 				email: 1,
// 				name: 1,
// 				role: 1
// 			})
// 			.exec(function(err, user) {
// 				if (err) {
// 					res.status(500).json({status: false, message: 'Ambil user gagal.', err: err});
// 				} else if (user == null || user == 0) {
// 					res.status(204).json({status: false, message: 'User tidak ditemukan.'});
// 				} else {
// 					res.status(200).json({status: true, message: 'Ambil user berhasil.', data: user});
// 				}
// 			})
// 	}
// }

// module.exports = new UserControllers();