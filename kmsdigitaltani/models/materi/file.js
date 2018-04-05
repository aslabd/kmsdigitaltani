var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    meta: {
        thumbnail: { type: String, default: null },
        jumlah_baca: { type: Number, default: 0 },
        jumlah_bagi: { type: Number, default: 0 },
        jumlah_suka: { type: Number, default: 0 }
    },
    pemilik: Schema.Types.ObjectId,                 
    tanggal: { 
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now } 
    },
    judul: String,
    nama: {
        asli: String,
        sistem: String
    },
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
    ukuran: Number,
    deskripsi: String,
    mimetype: String,
    extension: String,
    direktori: String,
    status: { type: String, enum: ['terbit', 'draft'], default: 'draft' }
});