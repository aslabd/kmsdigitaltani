// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var KomentarSchema = require('./../tanggapan/komentar');
var SubkategoriSchema = require('./../kategorisasi/subkategori');
var SukaSchema = require('./../tanggapan/suka');

// koneksikan skema dengan database
var Komentar = connection.model('Komentar', KomentarSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);
var Suka = connection.model('Suka', SukaSchema);

var Tanya = new Schema({
    meta: {
        jumlah: {
            suka: { type: Number, default: null },
            komentar: { type: Number, default: null }
        },
        saya: {
            suka: { type: Boolean, default: null }
        }
    },
    penulis: { type: Schema.Types.ObjectId, required: true },					
    tanggal: {
        terbit: { type: Date, default: Date.now }, 
        ubah: { type: Date, default: Date.now } ,
        hapus: { type: Date, default: null }
    },
    subkategori: { type: Schema.Types.ObjectId, ref: 'Subkategori', default: null },
    judul: { type: String, required: true, index: true },
    isi: { type: String, required: true, index: true },
    tag: [{ type: String, default: null, index: true }],
    status: { type: String, enum: ['terbit', 'draft', 'hapus'], default: 'draft' },
    suka: [{ type: Schema.Types.ObjectId, ref: 'Suka' }],
    komentar: [{ type: Schema.Types.ObjectId, ref: 'Komentar' }]
});

Tanya.index({
    judul: 'text',
    isi: 'text',
    tag: 'text'
});

module.exports = Tanya;