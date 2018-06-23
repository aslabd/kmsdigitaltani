var connection = ('./../connection')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	username: { type: String, required: true },
	email: {
		address: { type: String, required: true },
		status: { type: Boolean, default: false },
		otp_token: { type: Number, default: null }
	},
	telepon: {
		nomor: { type: String, default: null },
		status: { type: Boolean, default: false },
		otp_token: { type: Number, default: null }
	},
	password: { type: String, required: true },
	lupa: {
		status: Boolean,
		token: String
	},
	nama: { type: String, required: true },
	tanggal: {
		daftar: { type: Date, default: Date.now },
		ubah: { type: Date, default: Date.now },
		login: { type: Date, default: null },
	},
	status: { type: Boolean, default: false },
	role: { type: Number, default: 0 },
	foto: { type: String, default: null },
	alamat: {
		lokasi: { type: String, default: null },
		kodepos: { type: Number, default: null },
		// kelurahan: { type: Schema.Types.ObjectId, ref: 'Kelurahan' }
	}
});