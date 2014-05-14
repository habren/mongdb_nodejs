var _http = require('http');
var _url = require('url');
var _mongo = require('/opt/node/node-v0.10.3-linux-x64/bin/node_modules/mongodb/lib/mongodb');

var host = "9.123.197.164";
var port = 27017;
var user = "Mail";
var pass = "Mail1234";
var dbName = "Mail";
var collectionName = "mail";
var mongoURL = "mongodb://"+user+":"+pass+"@"+host+":"+port+"/"+dbName;

var server = new _mongo.Server(host, port, {poolSize:10});
var db = new _mongo.Db(dbName, server, {});

var nodeMailer = require("/opt/node/node_modules/nodemailer/lib/nodemailer.js")
var transport = nodeMailer.createTransport("SMTP", {
	host:"9.111.46.20",
	port:25	
});

db.open(function(err,db){
	console.log('DB connected.');
	db.authenticate(user,pass, function(err, result){
		if(err)console.error(err);		
		if(result){
			console.log('Auth ok.');
			send();
		}
	});
});


/*function send(){
	try{
		db.collection(collectionName,function(err,collection){
			if(err)console.error("Get collection error : "+err);
			else{
				collection.find({stat:"1"}).toArray(function(erre,docs){
					if(erre)console.error(erre);
					else{
						var len = docs.length;
						for(var i=0; i<len; i++){
							var doc = docs[i];
							console.log(i+" : "+JSON.stringify(doc));
						
							var gridStore = new _mongo.GridStore(db,new _mongo.ObjectID(doc.atid),'r');
							gridStore.open(function(erro,gs){
								if(erro)console.error("Open grid store error : "+erro);
								else{
									gridStore.read(function(err1,data){
										if(err1)console.error("Read gridstore error : "+err1);
										else{
											sendMail(doc,collection,data);
											gridStore.close(function(err,result){});
										}
									});
								}							
							});						
						}
					}	
				});
			}
			
		});
	}catch(ex){
		console.log("6");
		console.error("Exception name : "+ex.name+"    Exception content : "+ex.message);
	}
}*/
function send(){
	try{
		db.collection(collectionName,function(err,collection){
			if(err)console.error("Get collection error : "+err);
			else{
				collection.find({stat:"1"},function(erre,cursor){
					cursor.each(function(err,doc){
						if(erre)console.error(erre);
						else if(doc){
							console.log(JSON.stringify(doc));						
							var gridStore = new _mongo.GridStore(db,new _mongo.ObjectID(doc.atid),'r');
							gridStore.open(function(erro,gs){
								if(erro)console.error("Open grid store error : "+erro);
								else{
									gridStore.read(function(err1,data){
										if(err1)console.error("Read gridstore error : "+err1);
										else{
											sendMail(doc,collection,data,gridStore);
											//gridStore.close(function(err,result){});
										}
									});
								}							
							});						
						}	
					});
				});
			}
			
		});
	}catch(ex){
		console.log("6");
		console.error("Exception name : "+ex.name+"    Exception content : "+ex.message);
	}
}

function sendMail(doc,collection,data,gridStore){
	var message = {
		from : doc.from,
		to : doc.to,
		cc : doc.cc,
		bcc : doc.bcc,
		subject : doc.tit,		
		text : doc.body,
		attachments:[
			{
				fileName:doc.atna,
				contents:data
			}
		]
	};
	transport.sendMail(message, function(error,responseStatus){
		gridStore.close(function(err,result){
			if(err)console.error("Close grid store error : "+err);
			else{
				console.log("close grid store result : "+result);
			}
		});
		if(error){
			console.error(error.message);
			return;
		}
		var success = JSON.stringify(responseStatus);
		if(success.failedRecipients == undefined){
			//console.log("failed num : "+success.failedRecipients);
			console.log("key : "+doc._id);
			collection.findAndModify({_id:doc._id},{upsert:true},{$set:{stat:"4"}},function(err,doc){
				if(err)console.error(err);
				//process.exit(0);
			});
		}
		console.log('Message sent successfully : '+success);
	});	
}


