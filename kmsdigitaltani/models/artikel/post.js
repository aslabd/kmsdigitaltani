var connection = require('./../../connection');
//var connectionPH = require('./../../connectionPH');;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KomentarSchema = require('./../tanggapan/komentar');
//var UserSchema = require('./../user/user');

var Komentar = connection.model('Komentar', KomentarSchema);
//var User = connectionPH.model('User', UserSchema);

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
    tag: [{ type: String, default: null }],
    status: { type: String, enum: ['terbit', 'draft'], default: 'draft' },
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