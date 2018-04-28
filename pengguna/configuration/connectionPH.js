var mongoose = require('mongoose');

mongoose.connect('mongodb://PortalHarga:portal1234@abdurrohim.id:27017/PortalHarga', {
	socketTimeoutMS: 0,
	keepAlive: true,
	reconnectTries: 30
})
.then(function(connect) {
	console.log("Connection to PH OK");
})
.catch(function(err) {
	console.log(err);
});

module.exports = mongoose.connection;