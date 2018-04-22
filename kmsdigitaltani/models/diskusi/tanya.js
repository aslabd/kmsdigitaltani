// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var KomentarSchema = require('./../tanggapan/komentar');
var SubkategoriSchema = require('./../kategorisasi/subkategori');

// koneksikan skema dengan database
var Komentar = connection.model('Komentar', KomentarSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);

module.exports = new Schema({
    meta: {
        thumbnail: { type: String, default: null },
        jumlah: {
            bagi: { type: Number, default: 0 },
            baca: { type: Number, default: 0 },
            suka: { type: Number, default: 0 },
            komentar: { type: Number, default: 0 }
        }
    },
    penulis: Schema.Types.ObjectId,					
    tanggal: {
        terbit: { type: Date, default: Date.now }, 
        ubah: { type: Date, default: Date.now } 
    },
    subtopik: { type: Schema.Types.ObjectId, ref: 'Subtopik' },
    judul: String,
    ringkasan: { type: String, default: null },
    isi: String,
    tag: [{ type: String, default: null }],
    status: { type: String, enum: ['terbit', 'draft'], default: 'draft' },
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