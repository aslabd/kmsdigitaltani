var mongoose = require('mongoose');

module.exports = mongoose.createConnection('mongodb://localhost:27017/kms', {
	socketTimeoutMS: 0,
	keepAlive: true,
	reconnectTries: 30
});