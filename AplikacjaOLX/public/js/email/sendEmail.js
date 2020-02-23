const nodemailer = require('nodemailer');

async function sendEmail(recipient, from, subject, html) {
	try {
		let transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
			  user: process.env.GMAIL_ADRESS,
			  pass: process.env.GMAIL_PASSWORD 
			}
		});


		let info = await transporter.sendMail({
			from: from,
			to: recipient,
			subject: subject,
			text: "",
			html: html
		});
	} catch(err) {
		console.log(err);
	}
}

module.exports = sendEmail;