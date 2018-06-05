// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// definisi skema
module.exports = new Schema({
    meta: {
        thumbnail: { type: String, default: null }
    },
    pemilik: { type: Schema.Types.ObjectId, ref: 'User' },
    tanggal: { 
        unggah: { type: Date, default: Date.now }
    },
    jenis: { type: String, enum: ['gambar', 'materi']},
    nama: {
        asli: String,
        sistem: String
    },
    status: { type: Boolean, default: true },
    ukuran: Number,
    deskripsi: String,
    mimetype: String,
    extension: String,
    direktori: String
});