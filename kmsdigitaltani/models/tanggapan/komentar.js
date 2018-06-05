// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var BalasanSchema = require('./balasan');
var SukaSchema = require('./suka');

// koneksikan skema dengan database
var Balasan = connection.model('Balasan', BalasanSchema);
var Suka = connection.model('Suka', SukaSchema);

// definisi skema
module.exports = new Schema({
    meta: {
    	jumlah: {
            balasan: { type: Number, default: 0 },
            suka: { type: Number, default: 0 }
        }
    },
    jenis: { type: String, enum: ['artikel', 'diskusi', 'materi'] },
    penulis: Schema.Types.ObjectId,
    tanggal: {
        terbit : { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now },
        hapus: { type: Date, default: null }
    },
    isi: String,
    status: { type: String, enum: ['terbit', 'hapus'], default: 'terbit' },
    suka: [{ type: Schema.Types.ObjectId, ref: 'Suka' }],
    balasan: [{ type: Schema.Types.ObjectId, ref: 'Balasan' }]
});