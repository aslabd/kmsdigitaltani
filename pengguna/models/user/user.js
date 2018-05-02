var connection = ('./../configurations/connections/pengguna')
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
	lupa: {
		status: Boolean,
		token: String
	},
	nama: String,
	tanggal: {
		daftar: { type: Date, default: Date.now },
		ubah: { type: Date, default: Date.now },
		login: { type: Date, default: null }
	},
	status: Boolean,
	role: { type: Number, default: 0 },
	foto: String,
	alamat: {
		lokasi: String,
		kodepos: Number,
		//kelurahan: { type: Schema.Types.ObjectId, ref: 'Kelurahan' },
	}
});