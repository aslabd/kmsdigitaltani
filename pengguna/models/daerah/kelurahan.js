var connection = ('./../configuration/connectionPengguna')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	nama: String,
	kode: String,
	deskripsi: String,
	lokasi: {
		longitude:String,
		latitude: String
	},
	//kecamatan: { type: Schema.Types.ObjectId, ref: 'Kecamatan' }
});