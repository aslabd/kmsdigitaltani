var mongoose = require('mongoose');

module.exports = mongoose.createConnection('mongodb://127.0.0.1:27017/kms', {
	socketTimeoutMS: 0,
	keepAlive: true,
	reconnectTries: 30
});
