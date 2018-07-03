var fetch = require('node-fetch');

var Auth = require('./../../auth');

var Profil = require('./../../models/user/profil');

function ProfilControllers() {
	this.getFollower = function(req, res) {

	}

	this.getFollowing = function(req, res) {

	}

	this.follow = function(req, res) {
		let auth = true;

		let id = req.body.id;

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'})
		} else if (auth == false) {
			res.status(403).json({status: false, message: 'Sesi gagal. Silahkan login kembali.'});
		}
	}
}

module.exports = new ProfilControllers();