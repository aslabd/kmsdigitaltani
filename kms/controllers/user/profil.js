var Profil = require('./../../models/user/profil');

function ProfilControllers() {
	this.getFollower = function(req, res) {

	}

	this.getFollowing = function(req, res) {

	}

	this.follow = function(req, res) {
		let auth = true;

		if (auth == false) {
			res.status(403).json({status: false, message: 'Akses dilarang. Silahkan login kembali.'});
		}
	}
}

module.exports = new ProfilControllers();