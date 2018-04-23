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
			subkategori: { type: Number, default: 0 }
		}
	},
    nama: String,
    deskripsi: { type: String, default: null },
    subkategori: [{ type: Schema.Types.ObjectId, ref: 'Subkategori' }]
});