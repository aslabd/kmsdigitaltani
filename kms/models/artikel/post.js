var connection = require('./../../connection');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var KomentarSchema = require('./../tanggapan/komentar');
var SubkategoriSchema = require('./../kategorisasi/subkategori');
var SukaSchema = require('./../tanggapan/suka');

var Komentar = connection.model('Komentar', KomentarSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);
var Suka = connection.model('Suka', SukaSchema);


var Post = new Schema({
    meta: {
        thumbnail: { type: String, default: null },
        isi: { type: String, index: true},
        jumlah: {
            komentar: { type: Number, default: null },
            suka: { type: Number, default: null }
        },
        saya: {
            suka: { type: Boolean, default: null }
        },
        penulis: {
            username: { type: String, default: null },
            foto: { type: String, default: null },
            nama: { type: String, default: null },
            email: {
                address: { type: String, default: null }
            },
            role: { type: Number, default: null }
        }
    },
    penulis: { type: Schema.Types.ObjectId, required: true },					
    tanggal: {
        terbit: { type: Date, default: null }, 
        ubah: { type: Date, default: Date.now },
        hapus: { type: Date, default: null } 
    },
    judul: { type: String, required: true, index: true },
    ringkasan: { type: String, required: true, index: true },
    isi: { type: String, required: true },
    subkategori: { type: Schema.Types.ObjectId, ref: 'Subkategori' },
    tag: [{ type: String, default: null, index: true }],
    status: { type: String, enum: ['terbit', 'draft', 'hapus'], default: 'draft' },
    suka: [{ type: Schema.Types.ObjectId, ref: 'Suka' }],
    komentar: [{ type: Schema.Types.ObjectId, ref: 'Komentar' }]
});

Post.index({
    'meta.isi': 'text',
    judul: 'text',
    ringkasan: 'text',
    tag: 'text'
});

module.exports = Post;