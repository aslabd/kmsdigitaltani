var connection = ('./../connection')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	username: String,
	email: {
		address: String,
		status: { type: Boolean, default: false }
	},
	telepon: {
		nomor: String,
		status: { type: Boolean, default: false }
	},
	password: String,
	nama: String,
	tanggal: {
		daftar: { type: Date, default: Date.now },
		ubah: { type: Date, default: Date.now },
		login: { type: Date, default: null }
	}
	role: { type: Number, default: 0 },
	foto: String,
	alamat: String
});