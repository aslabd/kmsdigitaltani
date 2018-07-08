var connection = ('./../connection')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Role = new Schema({
	peran: { type: String, required: true },
	kode: {
		nama: { type: String, required: true, unique: true },
		nomor: { type: Number, required: true, unique: true }
	},
	deskripsi: { type: String, default: null }
});

Role.index({
    peran: 'text',
    'kode.nama': 'text',
    deskripsi: 'text'
});

module.exports = Role;