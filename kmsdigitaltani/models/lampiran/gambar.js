var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    pemilik: Schema.Types.ObjectId,                 
    tanggal: { 
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now } 
    },
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