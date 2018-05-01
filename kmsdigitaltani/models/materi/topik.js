// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var KomentarSchema = require('./../tanggapan/komentar');
var FileSchema = require('./../lampiran/file');
var SubkategoriSchema = require('./../kategorisasi/subkategori');

// koneksikan skema dengan database
var Komentar = connection.model('Komentar', KomentarSchema);
var File = connection.model('File', FileSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);

// definisi skema
module.exports = new Schema({
    meta: {
        thumbnail: { type: String, default: null },
        jumlah: {
            baca: { type: Number, default: 0 },
            bagi: { type: Number, default: 0 },
            suka: { type: Number, default: 0 }
        }
    },
    penulis: Schema.Types.ObjectId,                 
    tanggal: { 
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now } 
    },
    judul: String,
    deskripsi: String,
    subkategori: { type: Schema.Types.ObjectId, ref: 'Subkategori' },
    tag: [{ type: String, default: null }],
    status: { type: String, enum: ['terbit', 'draft'], default: 'draft' },
    materi: [{ type: Schema.Types.ObjectId, ref: 'File'}],
    bagi: [{
        pembagi: { type: Schema.Types.ObjectId, default: null },
        tanggal: { type: Date, default: Date.now },
        via: { type: String, enum: ['facebook', 'twitter', 'whatsapp', 'line', 'url'] } 
    }],
    baca: [{
        pembaca: { type: Schema.Types.ObjectId, default: null },
        tanggal: { type: Date, default: Date.now } 
    }],
    suka: [{
        penyuka: Schema.Types.ObjectId,
        tanggal: { type: Date, default: Date.now } 
    }],
    komentar: [{ type: Schema.Types.ObjectId, ref: 'Komentar' }]
});