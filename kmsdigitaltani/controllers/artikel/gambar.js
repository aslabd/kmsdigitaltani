// package yang dibutuhkan
var jwt = require('jsonwebtoken');
var multer = require('multer')

// koneksi ke database
var connection = require('./../../connection');

// skema yang dibutuhkan
var GambarSchema = require('./../../models/artikel/post');

// aktifkan skema ke database 
var Gambar = connection.model('Gambar', GambarSchema);


function GambarControllers() {
	
}

module.exports = new GambarControllers();