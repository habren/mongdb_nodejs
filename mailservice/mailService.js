var _http = require('http');
var _url = require('url');
var _fs = require('fs');
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

db.open(function(err,db){
	console.log('DB connected.');
	db.authenticate('Mail','Mail1234', function(err, result){
		if(err)console.error(err);		
		if(result){
			console.log('Auth ok.');
		}
	});
});
function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	res.write(callback+'(');
	res.write(JSON.stringify(data));
	res.end(');');
}
function SUCCESS(res){
	res.writeHead(201,{'Content-Type':'application/json;charset=utf-8'});
	res.end();
}
function getClientIP(req){
	var ipAddress = req.connection.remoteAddress;
	return ipAddress;
}
function exceptionHandler(res,ex){
	res.writeHead(500, {'Content-Type':'text/plain;charset=utf-8'});
	res.write('({"ExceptionName":');
	res.write('"'+ex.name+'","ExceptionMessage:"'+ex.message+'"');
	res.end('});');
}
function saveMail(req,res){
	if(req && res){
		try{
			var postData = "";
			req.setEncoding('utf8');
			req.addListener("data",function(postDataChunk){
				postData += postDataChunk;
			});
			req.addListener("end",function(){
				console.log("Received data : "+postData);
				//var jsonObj = eval("("+postData+")");
				var jsonObj = JSON.parse(postData);
				//console.log("id="+jsonObj.id+",key="+jsonObj.key);
				//console.log("request headers : "+JSON.stringify(req.headers));
				db.collection(collectionName, function(err, coll){
					coll.insert({ip:getClientIP(req),tit:jsonObj.title,body:jsonObj.body,reti:new Date(),from:jsonObj.from,frna:jsonObj.fromName,to:jsonObj.to,cc:jsonObj.cc,bcc:jsonObj.bcc,stat:jsonObj.status,prof:jsonObj.profile,atna:jsonObj.attachname,atid:jsonObj.attachid},function(err,result){				if(err)console.error(err);	
					SUCCESS(res);
					});
				});
				
			});			
		}catch(ex){
			exceptionHandler(res,ex);
		}
		
	}else{
		res.end();
	}
}
function saveAttachment(req,res){
	if(req && res){
		try{
			//var writeStream = _fs.createWriteStream("/root/test/outputfile.txt");
			req.setEncoding('utf8');
			req.on("data",function(postDataChunk){
				//writeStream.write(postDataChunk);
				console.log(postDataChunk);
				
				var gridStore = new _mongo.GridStore(db,new _mongo.ObjectID(),'w');
				gridStore.open(function(err,gridStore){
					if(err)console.error("Open gridstore error : "+err);
					else{
						gridStore.write(postDataChunk,function(err,gridStore){
							if(err)console.error("Write gridstore error : "+err);
							else{
								gridStore.close(function(err,result){
									if(err)console.error(err);
									else{
										console.log("GridStore closed!");
										console.log("Object ID : "+result._id);
										res.writeHead(201);
										res.write(result._id+'');
										res.end();
									}
								});
							}
						
						});
					}					
				});
				
			});
			req.on("end",function(){
				console.log("Receive data over!");
				//writeStream.end();
				//SUCCESS(res);
			});
		}catch(ex){
			exceptionHandler(res,ex);
		}
	}else{
		res.end();
	}
}

_http.createServer(function(req,res){
	var params = _url.parse(req.url,true);
	var query = params.query;
	
	if (params.pathname == '/mail'){
		saveMail(req,res);
	} else if(params.pathname == '/attachment'){
		saveAttachment(req,res);
	} else{
		res.writeHead(501,{'Content-Type':'text/plain;charset=utf-8'});
		res.end();
	}
}).listen(8091);
