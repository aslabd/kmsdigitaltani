// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SukaSchema = require('./suka');

var Suka = connection.model('Suka', SukaSchema);

// definisi skema
module.exports = new Schema({
	meta: {
		jumlah:{
            suka: { type: Number, default: 0 }
        },
        saya: {
            suka: { type: Boolean, default: null }
        },
        penulis: {
            username: { type: String, default: null },
            foto: { type: String, default: null },
            nama: { type: String, default: null },
            email: {
                address: { type: String, default: null }
            },
            role: { type: Number, default: null }
        }
	},
    penulis: Schema.Types.ObjectId,
    tanggal: {
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now },
        hapus: { type: Date, default: null }
    },
    isi: String,
    status: { type: String, enum: ['terbit', 'hapus'], default: 'terbit' },
    suka: [{ type: Schema.Types.ObjectId, ref: 'Suka' }]
});