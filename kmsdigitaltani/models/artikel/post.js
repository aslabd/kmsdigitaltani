var connection = require('./../../connection');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KomentarSchema = require('./../tanggapan/komentar');
var SubkategoriSchema = require('./../kategorisasi/subkategori');

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
    judul: String,
    ringkasan: { type: String, default: null },
    isi: String,
    subkategori: { type: Schema.Types.ObjectId, ref: 'Subkategori' },
    tag: [{ type: String, default: null }],
    status: { type: String, enum: ['terbit', 'draft', 'hapus'], default: 'draft' },
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