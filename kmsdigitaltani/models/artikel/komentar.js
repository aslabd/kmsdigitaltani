var connection = require('./../../connection');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BalasanSchema = require('./balasan');

var Balasan = connection.model('Balasan', BalasanSchema);

module.exports = new Schema({
    meta: [{
    	jumlah_balasan: { type: Number, default: 0 },
    	jumlah_suka: { type: Number, default: 0 }
    }],
    penulis: { type: Schema.Types.ObjectId, default: null },
    tanggal: {
        terbit : { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now }
    },
    isi: String,
    status: { type: String, enum: ['terbit', 'draft'], default: 'terbit' },
    suka: [{
    	penyuka: Schema.Types.ObjectId,
    	tanggal: { type: Date, default: Date.now }
    }],
    balasan: [{ type: Schema.Types.ObjectId, ref: 'Balasan' }]
});