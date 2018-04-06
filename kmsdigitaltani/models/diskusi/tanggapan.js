var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	meta: {
		jumlah_suka: { type: Number, default: 0 }
	},
    penulis: Schema.Types.ObjectId,
    tanggal: {
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now }
    },
    isi: String,
    suka: [{
    	penyuka: Schema.Types.ObjectId,
    	tanggal: { type: Date, default: Date.now }
    }]
});