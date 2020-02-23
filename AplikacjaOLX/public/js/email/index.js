const sendEmail = require('./sendEmail'),
	  emailMarkup = require('./emailMarkup');

module.exports = async (type, email, username, token) => {
	let from, subject, html;
	if(type === 'verification') {
		({from, subject, html} = emailMarkup.verification(username, token));
	} else if(type === 'resetPassword') {
		({from, subject, html} = emailMarkup.resetPassword(username, token));
	}
	await sendEmail(email, from, subject, html);
}