var fetch = require('node-fetch');

var Auth = require('./../../auth');

var configuration = require('./../../configuration');

var Profil = require('./../../models/user/profil');
var Follow = require('./../../models/user/follow');

function ProfilControllers() {
	this.isProfilAda = function(req, res) {

	}
	
	this.follow = async function(req, res) {
		let auth;
		try {
			auth = await Auth.verify(req);
		} catch (err) {
			res.status(401).json({status: false, message: 'Gagal otentikasi.'});
		}

		let id = req.body.id;

		try {
			let call = await fetch(configuration.url.digitaltani + '/user/' + id);
			let hasil = await user.json();
			let user = hasil.data._id;
		} catch (err) {
			res.status(500).json({status: false, message: 'Ambil pengguna gagal.', err: err});
		}

		if (id == null) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else if (user == null) {
			res.status(204).json({status: false, message: 'Pengguna tidak ditemukan.'});
		} else if (auth == false || auth.status == false || (![3, 4, 5, 6].includes(auth.data.role))) {
			res.status(403).json({status: false, message: 'Tidak dapat akses fungsi.'});
		} else {
			let pemilik = auth.data._id;

			Profil
				.find()
				.where('pemilik').equals(pemilik)
				.exec(function(err, profil) {
					if (err) {
						res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
					} else if (profil == null || profil == 0) {
						Profil
							.create({
								pemilik: pemilik
							})
							.then(function(profil) {
								Follow
									.create({
										user: user
									})
									.then(function(follow) {
										profil.follow
												.push(follow._id);
											
										profil
											.save(function(err, profil) {
												if (err) {
													res.status(500).json({status: false, message: 'Simpan profil gagal.', err: err});
												} else {
													res.status(200).json({status: true, message: 'Ikuti pengguna berhasil.', data: profil});
												}
											})
									})
									.catch(function(err) {
										res.status(500).json({status: false, message: 'Mengikuti pengguna gagal.', err: err});
									})
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Membuat profil gagal.', err: err});
							})
					} else {
						Profil
							.aggregate([{
								$lookup: {
									from: 'follows',
									localField: 'follow',
									foreignField: '_id',
									as: 'follow'
								}
							}, {
								$match: {
									pemilik: pemilik,
									'follow.user': user
								}
							}])
							.exec(function(err, diikuti) {
								if (err) {
									res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
								} else if (diikuti == null || diikuti == 0) {
									Follow
										.create({
											user: user
										})
										.then(function(follow) {
											profil.follow
												.push(follow._id);
											
											profil
												.save(function(err, follow) {
													if (err) {
														res.status(500).json({status: false, message: 'Simpan profil gagal.', err: err});
													} else {
														res.status(200).json({status: true, message: 'Ikuti pengguna berhasil.', data: topik});
													}
												})
										})
										.catch(function(err) {
											res.status(500).json({status: false, message: 'Ikuti pengguna gagal.', err: err});
										});
								} else {
									Suka
										.findByIdAndRemove(topik.suka[0])
										.then(function(suka) {
											topik.suka
												.pull(suka._id)
											
											topik
												.save(function(err, topik) {
													if (err) {
														res.status(500).json({status: false, message: 'Simpan batal suka materi gagal.', err: err});
													} else {
														res.status(200).json({status: true, message: 'Batal suka materi berhasil.', data: topik});
													}
												})
										})
										.catch(function(err) {
											res.status(500).json({status: false, message: 'Batal suka materi gagal.', err: err});
										});
								}
							});
					}
				})
		}
	}
}

module.exports = new ProfilControllers();