var mongoose = require('mongoose');
var connection = require('./../../connection');
var Schema = mongoose.Schema;

var User = new Schema({
    nama: String,
    email: String,
    role: { type: Number, default: 0 }
});

module.exports = connection.model('User', User);