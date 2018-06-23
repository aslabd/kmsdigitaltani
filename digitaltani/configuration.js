module.exports = {
	host: 'http://abdurrohim.id:3000/api',
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
		secret: 'digitaltaniipb2018'
	},
	mail: {
		address: 'aslamabdurrohim@gmail.com',
		password: 'apaandahyaihkamutuhjahatbangetsih'
	}
}