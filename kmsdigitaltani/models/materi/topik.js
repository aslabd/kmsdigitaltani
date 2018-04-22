// koneksi database yang dibutuhkan
var connection = require('./../../connection');
var connectionPH = require('./../../connectionPH');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var KomentarSchema = require('./../tanggapan/komentar');
var UserSchema = require('./../user/user');

// koneksikan skema dengan database
var Komentar = connection.model('Komentar', KomentarSchema);
var User = connectionPH.model('User', UserSchema);

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
    pemilik: { type: Schema.Types.ObjectId, ref: 'User' },                 
    tanggal: { 
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now } 
    },
    judul: String,
    deskripsi: String,
    status: { type: String, enum: ['terbit', 'draft'], default: 'draft' },
    materi: [{
        file: { type: Schema.Types.ObjectId, default: null }
    }],
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