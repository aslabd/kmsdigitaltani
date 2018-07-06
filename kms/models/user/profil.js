var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// koneksi database yang dibutuhkan
var connection = require('./../../connection');

var FollowSchema = require('./follow');
var Follow = connection.model('Follow', FollowSchema);

module.exports = new Schema({
   pemilik: { type: Schema.Types.ObjectId, required: true },
   follow: [{ type: Schema.Types.ObjectId, reference: 'Follow', default: null }]
});