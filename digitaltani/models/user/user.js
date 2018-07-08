var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connection = ('./../connection');
/*
Penjelasan role:
1 = admin
2 = pemerintah
3 = penyuluh
4 = petani
5 = pedagang
6 = masyarakat
7 = pakar
*/
var User = new Schema({
	username: { type: String, required: true, unique: true },
	email: {
		address: { type: String, required: true, unique: true },
		status: { type: Boolean, default: false },
		otp_token: { type: Number, default: null }
	},
	telepon: {
		nomor: { type: String, unique: true },
		status: { type: Boolean, default: false },
		otp_token: { type: Number, default: null }
	},
	password: { type: String, required: true },
	lupa: {
		status: { type: Boolean, default: null },
		token: { type: String, default: null }
	},
	nama: { type: String, required: true },
	tanggal: {
		daftar: { type: Date, default: Date.now },
		ubah: { type: Date, default: Date.now },
		login: { type: Date, default: null },
	},
	status: { type: Boolean, default: false },
	role: { type: Number, required: true },
	foto: { type: String, default: null },
	alamat: {
		lokasi: { type: String, default: null },
		kodepos: { type: Number, default: null },
		// kelurahan: { type: Schema.Types.ObjectId, ref: 'Kelurahan' }
	}
});

User.index({
    username: 'text',
    'email.address': 'text',
    'telepon.nomor': 'text',
    nama: 'text'
});

module.exports = User;