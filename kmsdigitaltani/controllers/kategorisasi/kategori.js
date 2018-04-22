var jwt = require('jsonwebtoken');

var connection = require('./../../connection');

var KategoriSchema = require('./../../models/kategorisasi/kategori');

var Kategori = connection.model('Kategori', KategoriSchema);

function KategoriControllers() {

}

module.exports = new KategoriControllers();