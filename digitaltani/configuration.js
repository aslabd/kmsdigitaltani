var fs = require('fs');

module.exports = {
	host: 'http://localhost:3030/api',
	database: {
		digitaltani: {
			uri: 'mongodb://abdurrohim.id:27017/digitaltani',
			options: {
				user: 'digitaltani',
				pass: 'digitaltani1234',
				autoIndex: false,
				autoReconnect: true,
				reconnectTries: Number.MAX_VALUE,
				reconnectInterval: 500,
				poolSize: 5,
				bufferMaxEntries: 0
			}
		}
	},
	jwt: {
		secret: fs.readFileSync('/etc/letsencrypt/live/abdurrohim.id/privkey.pem')
	},
	email: {
		address: 'portalharga.ipb@gmail.com',
		password: 'portalharga1234'
	}
}