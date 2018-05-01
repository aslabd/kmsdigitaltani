var mongoose = require('mongoose');

mongoose.connect('mongodb://kms:kms1234@abdurrohim.id:27017/kms', {
	socketTimeoutMS: 0,
	keepAlive: true,
	reconnectTries: 30
})
.then(function(connect) {
	console.log("Connection to KMS OK");
})
.catch(function(err) {
	console.log(err);
});

module.exports = mongoose.connection;