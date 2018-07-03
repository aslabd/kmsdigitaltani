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
            balasan: { type: Number, default: null },
            suka: { type: Number, default: null }
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