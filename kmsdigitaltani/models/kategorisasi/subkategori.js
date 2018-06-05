// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// definisi skema
module.exports = new Schema({
	meta: {
		thumbnail: String
	},
	tanggal: {
		terbit: { type: Date, default: Date.now },
		ubah: { type: Date, default: Date.now },
		hapus: { type: Date, default: null }
	},
    nama: String,
    deskripsi: String,
    status: { type: String, enum: ['terbit', 'hapus'], default: 'terbit' }
});