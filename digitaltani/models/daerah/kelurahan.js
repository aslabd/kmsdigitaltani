var connection = ('./../configuration/connectionPengguna')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	nama: { $type: String, required: true },
	deskripsi: { $type: String, default: null },
	titik: {
		type: { $type: String, default: 'Point' },
		coordinates: [Number]
	}
}, { typeKey: '$type' });