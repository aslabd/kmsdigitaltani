var nodemailer = require('nodemailer');

function Mail(mail, res) {
    // Set transporter SMTP
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports (default 587)
        auth: {
            user: 'portalharga.ipb@gmail.com',
            pass: 'portalharga1234'
        }
    });

    // Set email
    let mailOptions = {
        from: '"DigitalTani" <portalharga.ipb@gmail.com>',
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        attachments: mail.attachments
    };

    // Kirim email
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(500).json({status: false, message: 'Mengirim email gagal.', err: err});
        } else {
        	res.status(200).json({status: true, message: 'Mengirim email berhasil.', data: info});
        }
    });
}

module.exports = new Mail();