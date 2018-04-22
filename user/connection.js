var mongoose = require('mongoose');

module.exports = mongoose.createConnection('mongodb://167.99.78.119:27017/user', {
	socketTimeoutMS: 0,
	keepAlive: true,
	reconnectTries: 30
});
