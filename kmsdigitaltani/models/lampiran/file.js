// koneksi database yang dibutuhkan
var connectionPH = require('./../../connectionPH');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var UserSchema = require('./../user/user');

// koneksikan skema dengan database
var User = connectionPH.model('User', UserSchema);

// definisi skema
module.exports = new Schema({
    pemilik: { type: Schema.Types.ObjectId, ref: 'User' },                 
    tanggal: { 
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now } 
    },
    jenis: { type: String, enum: ['gambar', 'materi']},
    nama: {
        asli: String,
        sistem: String
    },
    ukuran: Number,
    deskripsi: String,
    mimetype: String,
    extension: String,
    direktori: String
});