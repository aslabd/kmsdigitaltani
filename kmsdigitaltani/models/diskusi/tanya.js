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
        jumlah: {
            bagi: { type: Number, default: 0, min: 0 },
            baca: { type: Number, default: 0, min: 0 },
            suka: { type: Number, default: 0, min: 0 },
            komentar: { type: Number, default: 0, min: 0 }
        }
    },
    penulis: { type: Schema.Types.ObjectId, required: true },					
    tanggal: {
        terbit: { type: Date, default: Date.now }, 
        ubah: { type: Date, default: Date.now } 
    },
    subkategori: { type: Schema.Types.ObjectId, ref: 'Subkategori', default: null },
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    tag: [{ type: String, default: null }],
    status: { type: String, enum: ['terbit', 'draft', 'hapus'], default: 'draft' },
    upvote: [{
        voter: { type: Schema.Types.ObjectId },
        tanggal: { type: Date, default: Date.now }
    }],
    downvote: [{
        voter: { type: Schema.Types.ObjectId },
        tanggal: { type: Date, default: Date.now }
    }],
    bagi: [{
        pembagi: { type: Schema.Types.ObjectId },
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