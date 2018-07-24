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
			post: { type: Number, default: null },
			tanya: { type: Number, default: null },
			topik: { type: Number, default: null },
			pengikut: { type: Number, default: null },
			ikuti: { type: Number, default: null }
		},
		saya: {
			ikuti: { type: Boolean, default: null }
		},
		user: {
            username: { type: String, default: null },
            foto: { type: String, default: null },
            nama: { type: String, default: null },
            email: {
                address: { type: String, default: null }
            },
            role: { type: Number, default: null }
        }
	},
	user: { type: Schema.Types.ObjectId, required: true },
	pengikut: [{ type: Schema.Types.ObjectId }]
});