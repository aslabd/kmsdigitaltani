var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
	meta: {
		thumbnail: String,
	},
    nama: String,
    keterangan: String,
    subtopik: [{
        
    }]
});