// koneksi database yang dibutuhkan
var connection = require('./../../connection');

// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// skema lain yang dibutuhkan
var KomentarSchema = require('./../tanggapan/komentar');
var FileSchema = require('./../lampiran/file');
var SubkategoriSchema = require('./../kategorisasi/subkategori');
var SukaSchema = require('./../tanggapan/suka');

// koneksikan skema dengan database
var Komentar = connection.model('Komentar', KomentarSchema);
var File = connection.model('File', FileSchema);
var Subkategori = connection.model('Subkategori', SubkategoriSchema);
var Suka = connection.model('Suka', SukaSchema);

// definisi skema
var Topik = new Schema({
    meta: {
        thumbnail: { type: String, default: null },
        jumlah: {
            suka: { type: Number, default: null },
            komentar: { type: Number, default: null }
        },
        saya: {
            suka: { type: Boolean, default: null }
        }
    },
    penulis: { type: Schema.Types.ObjectId, required: true },                 
    tanggal: { 
        terbit: { type: Date, default: Date.now },
        ubah: { type: Date, default: Date.now },
        hapus: { type: Date, default: null } 
    },
    judul: { type: String, required: true, index: true },
    deskripsi: { type: String, required: true, index: true },
    subkategori: { type: Schema.Types.ObjectId, ref: 'Subkategori' },
    tag: [{ type: String, default: null, index: true }],
    status: { type: String, enum: ['terbit', 'draft', 'hapus'], default: 'draft' },
    materi: [{ type: Schema.Types.ObjectId, ref: 'File'}],
    suka: [{ type: Schema.Types.ObjectId, ref: 'Suka' }],
    komentar: [{ type: Schema.Types.ObjectId, ref: 'Komentar' }]
});

Topik.index({
    judul: 'text',
    deskripsi: 'text',
    tag: 'text'
});

module.exports = Topik;