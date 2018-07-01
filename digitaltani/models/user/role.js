var connection = ('./../connection')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Role = new Schema({
	peran: { type: String, required: true, index: true },
	kode: {
		nama: { type: String, required: true, unique: true },
		nomor: { type: Number, required: true, unique: true }
	},
	deskripsi: { type: String, default: null, index: true }
});

module.exports = Role;