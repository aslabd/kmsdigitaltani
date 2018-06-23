// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var SubkategoriSchema = require('./subkategori');

// koneksikan skema dengan database
var Subkategori = connection.model('Subkategori', SubkategoriSchema);

// definisi skema
module.exports = new Schema({
	meta: {
		thumbnail: String,
		jumlah: {
			subkategori: { type: Number, default: null }
		}
	},
	tanggal: {
		terbit: { type: Date, default: Date.now },
		ubah: { type: Date, default: Date.now },
		hapus: { type: Date, default: null }
	},
    nama: String,
    deskripsi: { type: String, default: null },
    status: { type: String, enum: ['terbit', 'hapus'], default: 'terbit' },
    subkategori: [{ type: Schema.Types.ObjectId, ref: 'Subkategori' }]
});