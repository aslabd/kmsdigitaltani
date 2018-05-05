// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var BalasanSchema = require('./balasan');

// koneksikan skema dengan database
var Balasan = connection.model('Balasan', BalasanSchema);

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
        terbit : { type: Date, default: Date.now() },
        ubah: { type: Date, default: Date.now() }
    },
    isi: String,
    status: { type: String, enum: ['terbit', 'hapus'], default: 'terbit' },
    suka: [{
    	penyuka: Schema.Types.ObjectId,
    	tanggal: { type: Date, default: Date.now }
    }],
    balasan: [{ type: Schema.Types.ObjectId, ref: 'Balasan' }]
});