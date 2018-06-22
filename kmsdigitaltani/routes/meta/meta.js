var express = require('express');
var router = express.Router();

var meta = require('./../../controllers/meta/meta');

router.get('/:jenis/:id', function(req, res) {
	meta.get(req, res);
});

module.exports = router;
