var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Gambar = new Schema({
    pemilik: Schema.Types.ObjectId,                 
    tanggal: { 
        ubah: { type: Date, default: Date.now } 
    },
    nama: {
        asli: String,
        sistem: String
    },
    format: { type: String, enum: ['jpg', 'jpeg', 'png'] }
    tentang: { type: String, default: null },
    file: String
});

module.exports = mongoose.model('Gambar', Gambar);