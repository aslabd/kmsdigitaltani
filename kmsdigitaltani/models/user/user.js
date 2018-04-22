var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    username: String,
    name: String,
    email: String,
    role: { type: Number, default: 0 }
});