var fetch = require('node-fetch');
var configuration = require('./configuration');

function Auth() {
	this.verify = async function(req) {
		if (req.headers.authorization == null) {
			return false;
		} else {
			let options = {
				method: 'POST',
				headers: {
					'Authorization': req.headers.authorization
				}
			}

			try {
				let auth = await fetch(configuration.url.digitaltani + '/user/auth', options);
				let hasil = await auth.json();

				if (hasil.status == true) {
					return hasil;
				} else {
					return false;
				}
			} catch (err) {
				return false;
			}
		}
	}
}

module.exports = new Auth();