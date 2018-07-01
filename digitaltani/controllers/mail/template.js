var configuration = require('./../../configuration');
function TemplateControllers() {
	this.getVerifyEmail = function(user, secret, token) {
		let url = configuration.host '/user/verifikasi/email/' + token;
		let html = 	'<p>Yth. Bapak/Ibu' + user.nama + '(' + user.username + ').</p>' +
					'<p>Kami menerima permintaan verifikasi email baru. Silahkan klik link di bawah ini untuk melakukan verifikasi email Anda.</p>' +
					'<p><a href="' + url + '">Klik disini</a></p>' +
					'<p>Setelah Anda mengklik link di atas dan muncul halaman login, silahkan lakukan login seperti biasa.</p>' +
					'<p>' +
						'Terima kasih.<br>' +
						'Digital Tani | SEIS Ilmu Komputer IPB' +
					'</p>';
		return html;
	}

	this.setVerifyEmail = function(user) {
		let html = 	'<p>Yth. Bapak/Ibu' + user.nama + '(' + user.username + ').</p>' +
					'<p>Terima kasih telah melakukan verifikasi email. Silahkan lakukan login seperti biasa.</p>' +
					'<p>' +
						'Terima kasih.<br>' +
						'Digital Tani | SEIS Ilmu Komputer IPB' +
					'</p>';
		return html;
	}

	this.getLupaPassword = function(user, token) {
		let url = configuration.host '/user/lupa/password/' + token;
		let html = 	'<p>Yth. Bapak/Ibu' + user.nama + '(' + user.username + ').</p>' +
					'<p>Kami menerima permintaan penggantian password untuk akun Anda. Apabila benar bahwa Anda melakukan permintaan tersebut, silahkan klik link di bawah ini untuk melakukan penggantian password.</p>' +
					'<p><a href="' + url + '">Klik disini</a></p>' +
					'<p>Setelah Anda mengklik link di atas, akan muncul formulir penggantian password. Silahkan lengkapi formulir tersebut.</p>' +
					'<p>' +
						'Terima kasih.<br>' +
						'Digital Tani | SEIS Ilmu Komputer IPB' +
					'</p>';
		return html;
	}

	this.setLupaPassword = function(user) {
		let html = 	'<p>Yth. Bapak/Ibu' + user.nama + '(' + user.username + ').</p>' +
					'<p>Penggantian password akun Anda <b>berhasil</b>. Silahkan lakukan login seperti biasa.</p>' +
					'<p>' +
						'Terima kasih.<br>' +
						'Digital Tani | SEIS Ilmu Komputer IPB' +
					'</p>';
		return html;
	}
}

module.exports = new TemplateControllers();