var fetch = require('node-fetch');
var configuration = require('./configuration');

function Auth() {
	this.verify = async function(req, res) {
		try {
			if (req.headers.authorization == null) {
				return false;
			} else {
				let options = {
					headers: {
						'Authorization': req.headers.authorization
					}
				}

				let auth = await fetch(configuration.host + '/api/user/auth', options);
				let hasil = await auth.json();

				if (hasil.status == true) {
					return hasil;
				} else {
					return false;
				}
			}
		} catch (err) {
			return false;
		}
	}
}

module.exports = new Auth();