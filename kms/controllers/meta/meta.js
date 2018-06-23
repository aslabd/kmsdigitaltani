// package yang dibutuhkan
var fetch = require('node-fetch');

// konfigurasi lainnya
var configuration = require('./../../configuration');

// fungsi controller Meta
function MetaControllers () {
	// Mengambil meta
	this.get = async function(req, res) {
		try {
			// Ambil token dulu (untuk meta yang berhubungan dengan user secara personal)
			let authorization = req.headers.authorization;
			
			// Ambil semua parameter
			let jenis = req.params.jenis;
			let id = req.params.id;

			// Variabel untuk simpan call dan json
			let temp = {}

			// Variabel untuk simpan meta
			let meta = {}

			switch (jenis) {
				case 'artikel':
				case 'diskusi':
				case 'materi':
					temp = {
						jumlah: {
							suka: {},
							komentar: {}
						},
						saya: {
							suka: {}
						}
					};

					meta = {
						jumlah: {
							suka: {},
							komentar: {}
						},
						saya: {
							suka: {}
						}
					};
					break;
				case 'komentar':
					temp = {
						jumlah: {
							suka: {},
							balasan: {}
						},
						saya: {
							suka: {}
						}
					};

					meta = {
						jumlah: {
							suka: {},
							balasan: {}
						},
						saya: {
							suka: {}
						}
					};
					break;
				case 'balasan':
					temp = {
						jumlah: {
							suka: {}
						},
						saya: {
							suka: {}
						}
					};

					meta = {
						jumlah: {
							suka: {}
						},
						saya: {
							suka: {}
						}
					};
			}

			
			// Ambil jumlah suka
			temp.jumlah.suka.call = await fetch(configuration.host + '/tanggapan/suka/' + jenis + '/' + id + '/jumlah');
			temp.jumlah.suka.json = await temp.jumlah.suka.call.json();
			if (temp.jumlah.suka.json.data[0] == null) {
				meta.jumlah.suka = 0;
			} else {
				meta.jumlah.suka = temp.jumlah.suka.json.data[0].jumlah_suka;
			}

			// Ambil jumlah komentar dari 3 fungsi utama
			switch (jenis) {
				case 'artikel':
				case 'diskusi':
				case 'materi':
					temp.jumlah.komentar.call = await fetch(configuration.host + '/tanggapan/komentar/' + jenis + '/' + id + '/jumlah');
					temp.jumlah.komentar.json = await temp.jumlah.komentar.call.json();
					if (temp.jumlah.komentar.json.data[0] == null) {
						meta.jumlah.komentar = 0;
					} else {
						meta.jumlah.komentar = temp.jumlah.komentar.json.data[0].jumlah_komentar;
					}				
			}

			// Ambil jumlah balasan jika jenisnya komentar
			if (jenis == 'komentar') {
				temp.jumlah.balasan.call = await fetch(configuration.host + '/tanggapan/balasan/komentar/' + id + '/jumlah');
				temp.jumlah.balasan.json = await temp.jumlah.balasan.call.json();
				if (temp.jumlah.komentar.json.data[0] == null) {
					meta.jumlah.komentar = 0;
				} else {
					meta.jumlah.komentar = temp.jumlah.komentar.json.data[0].jumlah_komentar;
				}
			}

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
			console.log(err);
			res.status(500).json({status: false, message: 'Ambil meta gagal.', err: err});
		}
	}
}

module.exports = new MetaControllers();