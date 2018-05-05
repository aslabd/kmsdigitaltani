// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// definisi skema
module.exports = new Schema({
	meta: {
		jumlah:{
            suka: { type: Number, default: 0 }
        }
	},
    penulis: Schema.Types.ObjectId,
    tanggal: {
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now }
    },
    isi: String,
    status: { type: String, enum: ['terbit', 'hapus'], default: 'terbit' },
    suka: [{
    	penyuka: Schema.Types.ObjectId,
    	tanggal: { type: Date, default: Date.now }
    }]
});