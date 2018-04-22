var jwt = require('jsonwebtoken');

var connection = require('./../../connection');

var SubkategoriSchema = require('./../../models/kategorisasi/subkategori');

var Subkategori = connection.model('Subkategori', SubkategoriSchema);

function SubkategoriControllers() {

}

module.exports = new SubkategoriControllers();