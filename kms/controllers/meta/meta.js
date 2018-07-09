// package yang dibutuhkan
var fetch = require('node-fetch');

// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// konfigurasi lainnya
var configuration = require('./../../configuration');

// skema yang dibutuhkan
var PostSchema = require('./../../models/artikel/post');
var TanyaSchema = require('./../../models/diskusi/tanya');
var TopikSchema = require('./../../models/materi/topik');
var KomentarSchema = require('./../../models/tanggapan/komentar');
var BalasanSchema = require('./../../models/tanggapan/balasan');
var ProfilSchema = require('./../../models/user/profil');

// koneksikan skema dengan database
var Post = connection.model('Post', PostSchema);
var Tanya = connection.model('Tanya', TanyaSchema);
var Topik = connection.model('Topik', TopikSchema);
var Komentar = connection.model('Komentar', KomentarSchema);
var Balasan = connection.model('Balasan', BalasanSchema);
var Profil = connection.model('Profil', ProfilSchema);

// fungsi controller Meta
function MetaControllers () {
	// Mengambil meta
	this.getForProfil = function(req, res) {
		// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
		let authorization = req.headers.authorization;
		
		// Ambil semua parameter
		let user = req.params.user;

		// Variabel untuk simpan call dan json
		let temp = {
			jumlah: {
				post: {},
				tanya: {},
				topik: {}
			},
			saya: {
				ikuti: {}
			},
			user: {}
		};

		let	meta = {
			jumlah: {
				post: {},
				tanya: {},
				topik: {}
			},
			saya: {
				ikuti: {}
			},
			user: {}
		};

		Profil
			.findOne()
			.where('user').equals(user)
			.exec(function(err, profil) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil profil gagal.', err: err});
				} else if (profil == null || profil == 0) {
					res.status(204).json({status: false, message: 'Profil tidak ditemukan.'});
				} else {
					(async() => {
						try {
							// Ambil jumlah post
							temp.jumlah.post.call = await fetch(configuration.host + '/artikel/post/penulis/' + user + '/jumlah');
							temp.jumlah.post.json = await temp.jumlah.post.call.json();
							if (temp.jumlah.post.json.data[0] == null) {
								meta.jumlah.post = 0;
							} else {
								meta.jumlah.post = temp.jumlah.post.json.data[0].jumlah_post;
							}

							// Ambil jumlah tanya
							temp.jumlah.tanya.call = await fetch(configuration.host + '/diskusi/tanya/penulis/' + user + '/jumlah');
							temp.jumlah.tanya.json = await temp.jumlah.tanya.call.json();
							if (temp.jumlah.tanya.json.data[0] == null) {
								meta.jumlah.tanya = 0;
							} else {
								meta.jumlah.tanya = temp.jumlah.tanya.json.data[0].jumlah_tanya;
							}

							// Ambil jumlah topik
							temp.jumlah.topik.call = await fetch(configuration.host + '/materi/topik/penulis/' + user + '/jumlah');
							temp.jumlah.topik.json = await temp.jumlah.topik.call.json();
							if (temp.jumlah.topik.json.data[0] == null) {
								meta.jumlah.topik = 0;
							} else {
								meta.jumlah.topik = temp.jumlah.topik.json.data[0].jumlah_topik;
							}

							// Ambil user
							temp.user.call = await fetch(configuration.url.digitaltani + '/user/' + user);
							temp.user.json = await temp.user.call.json();
							meta.user = temp.user.json.data;

							// Ambil flag saya suka suatu jenis dengan id
							if (authorization == null) {
								meta.saya.ikuti = null;
							} else {
								let options = {
									headers: {
										'Authorization': authorization
									}
								}
								temp.saya.ikuti.call = await fetch(configuration.host + '/user/profil/ikuti/' + user + '/saya', options);
								temp.saya.ikuti.json = await temp.saya.ikuti.call.json();
								meta.saya.ikuti = temp.saya.ikuti.json.data;
							}
							res.status(200).json({status: true, message: 'Ambil meta berhasil.', data: meta});
						} catch (err) {
							res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
						}
					})();
				}
			});
	}

	this.getForPost = function(req, res) {
		// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
		let authorization = req.headers.authorization;
		
		// Ambil semua parameter
		let jenis = req.params.jenis;
		let id = req.params.id;

		// Variabel untuk simpan call dan json
		let temp = {
			jumlah: {
				suka: {},
				komentar: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		let	meta = {
			jumlah: {
				suka: {},
				komentar: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		Post
			.findById(id)
			.select({
				penulis: 1
			})
			.exec(function(err, post) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
				} else if (post == null || post == 0) {
					res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
				} else {
					(async() => {
						try {
							// Ambil jumlah suka
							temp.jumlah.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.suka.json = await temp.jumlah.suka.call.json();
							if (temp.jumlah.suka.json.data[0] == null) {
								meta.jumlah.suka = 0;
							} else {
								meta.jumlah.suka = temp.jumlah.suka.json.data[0].jumlah_suka;
							}

							// Ambil jumlah komentar
							temp.jumlah.komentar.call = await fetch(configuration.host + '/tanggapan/komentar/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.komentar.json = await temp.jumlah.komentar.call.json();
							if (temp.jumlah.komentar.json.data[0] == null) {
								meta.jumlah.komentar = 0;
							} else {
								meta.jumlah.komentar = temp.jumlah.komentar.json.data[0].jumlah_komentar;
							}

							// Ambil penulis
							temp.penulis.call = await fetch(configuration.url.digitaltani + '/user/' + post.penulis);
							temp.penulis.json = await temp.penulis.call.json();
							meta.penulis = temp.penulis.json.data;

							// Ambil flag saya suka suatu jenis dengan id
							if (authorization == null) {
								meta.saya.suka = null;
							} else {
								let options = {
									headers: {
										'Authorization': authorization
									}
								}
								temp.saya.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/saya', options);
								temp.saya.suka.json = await temp.saya.suka.call.json();
								meta.saya.suka = temp.saya.suka.json.data;
							}
							res.status(200).json({status: true, message: 'Ambil meta berhasil.', data: meta});
						} catch (err) {
							res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
						}
					})();
				}
			});
	}

	this.getForTanya = function(req, res) {
		// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
		let authorization = req.headers.authorization;
		
		// Ambil semua parameter
		let jenis = req.params.jenis;
		let id = req.params.id;

		// Variabel untuk simpan call dan json
		let temp = {
			jumlah: {
				suka: {},
				komentar: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		let	meta = {
			jumlah: {
				suka: {},
				komentar: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		Tanya
			.findById(id)
			.select({
				penulis: 1
			})
			.exec(function(err, tanya) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
				} else if (tanya == null || tanya == 0) {
					res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
				} else {
					(async() => {
						try {
							// Ambil jumlah suka
							temp.jumlah.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.suka.json = await temp.jumlah.suka.call.json();
							if (temp.jumlah.suka.json.data[0] == null) {
								meta.jumlah.suka = 0;
							} else {
								meta.jumlah.suka = temp.jumlah.suka.json.data[0].jumlah_suka;
							}

							// Ambil jumlah komentar
							temp.jumlah.komentar.call = await fetch(configuration.host + '/tanggapan/komentar/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.komentar.json = await temp.jumlah.komentar.call.json();
							if (temp.jumlah.komentar.json.data[0] == null) {
								meta.jumlah.komentar = 0;
							} else {
								meta.jumlah.komentar = temp.jumlah.komentar.json.data[0].jumlah_komentar;
							}

							// Ambil penulis
							temp.penulis.call = await fetch(configuration.url.digitaltani + '/user/' + tanya.penulis);
							temp.penulis.json = await temp.penulis.call.json();
							meta.penulis = temp.penulis.json.data;

							// Ambil flag saya suka suatu jenis dengan id
							if (authorization == null) {
								meta.saya.suka = null;
							} else {
								let options = {
									headers: {
										'Authorization': authorization
									}
								}
								temp.saya.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/saya', options);
								temp.saya.suka.json = await temp.saya.suka.call.json();
								meta.saya.suka = temp.saya.suka.json.data;
							}
							res.status(200).json({status: true, message: 'Ambil meta berhasil.', data: meta});
						} catch (err) {
							res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
						}
					})();
				}
			});
	}

	this.getForTopik = function(req, res) {
		// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
		let authorization = req.headers.authorization;
		
		// Ambil semua parameter
		let jenis = req.params.jenis;
		let id = req.params.id;

		// Variabel untuk simpan call dan json
		let temp = {
			jumlah: {
				suka: {},
				komentar: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		let	meta = {
			jumlah: {
				suka: {},
				komentar: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		Topik
			.findById(id)
			.select({
				penulis: 1
			})
			.exec(function(err, tanya) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
				} else if (tanya == null || tanya == 0) {
					res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
				} else {
					(async() => {
						try {
							// Ambil jumlah suka
							temp.jumlah.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.suka.json = await temp.jumlah.suka.call.json();
							if (temp.jumlah.suka.json.data[0] == null) {
								meta.jumlah.suka = 0;
							} else {
								meta.jumlah.suka = temp.jumlah.suka.json.data[0].jumlah_suka;
							}

							// Ambil jumlah komentar
							temp.jumlah.komentar.call = await fetch(configuration.host + '/tanggapan/komentar/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.komentar.json = await temp.jumlah.komentar.call.json();
							if (temp.jumlah.komentar.json.data[0] == null) {
								meta.jumlah.komentar = 0;
							} else {
								meta.jumlah.komentar = temp.jumlah.komentar.json.data[0].jumlah_komentar;
							}

							// Ambil penulis
							temp.penulis.call = await fetch(configuration.url.digitaltani + '/user/' + topik.penulis);
							temp.penulis.json = await temp.penulis.call.json();
							meta.penulis = temp.penulis.json.data;

							// Ambil flag saya suka suatu jenis dengan id
							if (authorization == null) {
								meta.saya.suka = null;
							} else {
								let options = {
									headers: {
										'Authorization': authorization
									}
								}
								temp.saya.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/saya', options);
								temp.saya.suka.json = await temp.saya.suka.call.json();
								meta.saya.suka = temp.saya.suka.json.data;
							}
							res.status(200).json({status: true, message: 'Ambil meta berhasil.', data: meta});
						} catch (err) {
							res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
						}
					})();
				}
			});
	}

	this.getForKomentar = async function(req, res) {
		// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
		let authorization = req.headers.authorization;
			
		// Ambil semua parameter
		let jenis = req.params.jenis;
		let id = req.params.id;

		// Variabel untuk simpan call dan json
		let temp = {
			jumlah: {
				suka: {},
				balasan: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		let meta = {
			jumlah: {
				suka: {},
				balasan: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		Komentar
			.findById(id)
			.select('penulis')
			.exec(function(err, komentar) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
				} else if (komentar == null || komentar == 0) {
					res.status(204).json({status: false, message: 'Komentar tidak ditemukan'});
				} else {
					(async() => {
						try {
							// Ambil jumlah suka
							temp.jumlah.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.suka.json = await temp.jumlah.suka.call.json();
							if (temp.jumlah.suka.json.data[0] == null) {
								meta.jumlah.suka = 0;
							} else {
								meta.jumlah.suka = temp.jumlah.suka.json.data[0].jumlah_suka;
							}

							// Ambil jumlah balasan
							temp.jumlah.balasan.call = await fetch(configuration.host + '/tanggapan/balasan/komentar/' + id + '/jumlah');
							temp.jumlah.balasan.json = await temp.jumlah.balasan.call.json();
							if (temp.jumlah.balasan.json.data[0] == null) {
								meta.jumlah.balasan = 0;
							} else {
								meta.jumlah.balasan = temp.jumlah.balasan.json.data[0].jumlah_balasan;
							}

							// Ambil penulis
							temp.penulis.call = await fetch(configuration.url.digitaltani + '/user/' + komentar.penulis);
							temp.penulis.json = await temp.penulis.call.json();
							meta.penulis = temp.penulis.json.data;
							
							// Ambil flag saya suka
							if (authorization == null) {
								meta.saya.suka = null;
							} else {
								let options = {
									headers: {
										'Authorization': authorization
									}
								}
								temp.saya.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/saya', options);
								temp.saya.suka.json = await temp.saya.suka.call.json();
								meta.saya.suka = temp.saya.suka.json.data;
							}
							res.status(200).json({status: true, message: 'Ambil meta berhasil.', data: meta});
						} catch (err) {
							res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
						}
					})();
				}
			});
	}

	this.getForBalasan = async function(req, res) {
		// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
		let authorization = req.headers.authorization;
			
		// Ambil semua parameter
		let jenis = req.params.jenis;
		let id = req.params.id;

		// Variabel untuk simpan call dan json
		let temp = {
			jumlah: {
				suka: {},
				balasan: {}
			},
			saya: {
				suka: {}
			}
		};

		let meta = {
			jumlah: {
				suka: {}
			},
			saya: {
				suka: {}
			},
			penulis: {}
		};

		Balasan
			.findById(id)
			.select('penulis')
			.exec(function(err, balasan) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
				} else if (komentar == null || komentar == 0) {
					res.status(204).json({status: false, message: 'Komentar tidak ditemukan'});
				} else {
					(async() => {
						try {
							// Ambil jumlah suka
							temp.jumlah.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/jumlah');
							temp.jumlah.suka.json = await temp.jumlah.suka.call.json();
							if (temp.jumlah.suka.json.data[0] == null) {
								meta.jumlah.suka = 0;
							} else {
								meta.jumlah.suka = temp.jumlah.suka.json.data[0].jumlah_suka;
							}

							// Ambil penulis
							temp.penulis.call = await fetch(configuration.url.digitaltani + '/user/' + balasan.penulis);
							temp.penulis.json = await temp.penulis.call.json();
							meta.penulis = temp.penulis.json.data;
							
							// Ambil flag saya suka
							if (authorization == null) {
								meta.saya.suka = null;
							} else {
								let options = {
									headers: {
										'Authorization': authorization
									}
								}
								temp.saya.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/saya', options);
								temp.saya.suka.json = await temp.saya.suka.call.json();
								meta.saya.suka = temp.saya.suka.json.data;
							}
							res.status(200).json({status: true, message: 'Ambil meta berhasil.', data: meta});
						} catch (err) {
							res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
						}
					})();
				}
			});
	}
}

module.exports = new MetaControllers();
