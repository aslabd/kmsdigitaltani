// package yang dibutuhkan
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// definisi skema
module.exports = new Schema({
    penyuka: Schema.Types.ObjectId,
    tanggal: { type: Date, default: Date.now },
});