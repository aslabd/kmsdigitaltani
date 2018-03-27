var express = require('express');
var router = express.Router();

var user = require('./../../controllers/user/user');

router.get('/', function(req, res) {
	res.status(410).json({status: false, message: 'Tidak ada apa-apa disini.'});
});

router.post('/tambah', function(req, res) {
	user.add(req, res)
});

module.exports = router;
