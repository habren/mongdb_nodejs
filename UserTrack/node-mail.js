var nodeMailer = require("/opt/node/Nodemailer-master/lib/nodemailer.js")
var transport = nodeMailer.createTransport("SMTP", {
	auth:{
		user:"gj1989lh@163.com",
		pass:"jgg&qadmtcyc"
	}
});
console.log("SMTP configured!");

var message = {
	from : "gj1989lh@163.com",
	to : "gj1989lh@163.com",
	subject : "Test for node mailer",
	headers : {
		'X-Laziness-level' : 1000
	},
	text : 'Hello to myself!',
	html:'<p><b>Hello</b></p>',
	attachments: [
		{
			fileName : 'notes.txt',
			contents : 'Some notes about this e-mail',
			contentType : 'text/plain'
		}
	]
};
console.log('Sending Mail');
transport.sendmail(message, function(error){
	if(error){
		console.error(error.message);
		return;
	}
	console.log('Message sent successfully!');
});	
