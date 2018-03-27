var User = require('./../../models/user/user');

function UserControllers() {
	this.getAll = function(req, res) {

	}

	this.add = function(req, res) {
		var nama = req.body.nama;
		var email = req.body.email;
		var role = req.body.role;

		if (nama !== null && email !== null && role !== null) {
			User.find({
				email: email
			})
			.then(function(result) {
				if (result !== null || result !== 0) {
					res.status(406).json({status: false, message: 'Email sudah pernah didaftarkan.'});
				} else {
					User.create({
						nama: nama,
						email: email,
						role: role
					})
					.then(function(result) {
						res.status(200).json({status: true, message: 'Menyimpan user berhasil.'});
					})
					.catch(function(err) {
						res.status(400).json({status: false, message: 'Menyimpan user baru gagal.'})
					});
				}
			})
			.catch(function(err) {
				res.status(400).json({status: false, message: 'Mencari user gagal.'})
			});
		} else {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		}
	}

	this.delete = function(req, res) {

	}
}

module.exports = new UserControllers();