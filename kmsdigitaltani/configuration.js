module.exports = {
	host: 'http://abdurrohim.id:3000/api',
	database: {
		kms: {
			uri: 'mongodb://abdurrohim.id:27017/kms',
			options: {
				user: 'kms',
				pass: 'kms1234',
				autoIndex: false,
				autoReconnect: true,
				reconnectTries: Number.MAX_VALUE,
				reconnectInterval: 500,
				poolSize: 5,
				bufferMaxEntries: 0
			}
		}
	}
}