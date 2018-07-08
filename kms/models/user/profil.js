/*
Catatan:
Profil hanya dibuat untuk setiap pengguna yang dapat menerbitkan artikel dan materi
*/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// koneksi database yang dibutuhkan
var connection = require('./../../connection');

module.exports = new Schema({
	meta: {
		jumlah: {
			artikel: { type: Number, default: null },
			materi: { type: Number, default: null },
			pengikut: { type: Number, default: null }
		}
	},
	user: { type: Schema.Types.ObjectId, required: true },
	pengikut: [{ type: Schema.Types.ObjectId }]
});