var nodemailer = require('nodemailer');
var configuration = require('./../../configuration');
var template = require('./template');

function generateRandomString() {
	let random = '';
	let karakter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 6; i++) {
		random += karakter.charAt(Math.floor(Math.random() * possible.length));
	}
	return random;
}

function generateRandomNumber() {
	let random = '';
	let karakter = '0123456789';
	for (let i = 0; i < 6; i++) {
		random += karakter.charAt(Math.floor(Math.random() * possible.length));
	}
	return random;
}

// definisikan fungsi untuk membuat token sebagai async/await
async function createTokenForVerify(user, secret, res) {
	try {
		let kadaluarsa = 30 * 60

		let token = await jwt.sign({
			user: user
		}, secret ,{
			expiresIn: kadaluarsa
		})

		return token;
	} catch (err) {
		return new Error(err);
	}
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: configuration.email.address,
        pass: configuration.email.password
    }
});

var mailOptions = {
	from: '"Digital Tani" <' + configuration.email.address + '>',
	to: null,
	subject: null,
	html: null
};


async function send(mailOptions) {
	try {
		let kirim = transporter.sendMail(mailOptions);
		return kirim;
	} catch (err) {
		return new Error(err);
	}
}

function MailControllers() {
	this.getVerifyEmailAddress = async function(user, token, res) {
		mailOptions = {
	        to: user.email.address,
	        subject: 'Lakukan Verifikasi Email',
	        html: template.getVerifyEmailAddress(user, token)
	    };

	    return send(mailOptions);
	}

	this.setVerifyEmailAddress = function(user, res) {
		mailOptions = {
	        to: user.email.address,
	        subject: 'Email Telah Terverifikasi',
	        html: template.setVerifyEmailAddress(user)
	    };

	    return send(mailOptions);
	}

	this.getLupaPassword = function(user, token, res) {
		mailOptions = {
	        to: user.email.address,
	        subject: 'Permintaan Penggantian Password',
	        html: template.getLupaPassword(user, token)
	    };

	    return send(mailOptions);
	}

	this.setLupaPassword = function(user, res) {
		mailOptions = {
	        to: user.email.address,
	        subject: 'Password Anda Telah Berubah',
	        html: template.setLupaPassword(user)
	    };

	    return send(mailOptions);
	}
}

module.exports = new MailControllers();