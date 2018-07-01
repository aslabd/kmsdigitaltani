var fs = require('fs');

module.exports = {
	host: 'https://abdurrohim.id:3000/api',
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
		// secret: 'enakmantepportal'
		secret: fs.readFileSync('/etc/letsencrypt/live/abdurrohim.id/privkey.pem')
	},
	email: {
		address: 'portalharga.ipb@gmail.com',
		password: 'portalharga1234'
	},
	// role: {
	// 	1: 'admin',
	// 	2: 'pemerintah',
	// 	3: 'penyuluh',
	// 	4: 'petani',
	// 	5: 'masyarakat',
	// 	6: 'pedagang'
	// }
}