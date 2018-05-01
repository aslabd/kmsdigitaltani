var mongoose = require('mongoose');

mongoose.connect('mongodb://pengguna:pengguna1234@abdurrohim.id:27017/pengguna', {
	socketTimeoutMS: 0,
	keepAlive: true,
	reconnectTries: 30
})
.then(function(connect) {
	console.log("Connection to Pengguna OK");
})
.catch(function(err) {
	console.log(err);
});

module.exports = mongoose.connection;