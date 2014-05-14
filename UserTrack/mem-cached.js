var _http = require('http');
var _url = require('url');
var _mongo = require('/opt/node/node-v0.10.3-linux-x64/bin/node_modules/mongodb/lib/mongodb');

var defaultDB = "UserTrack";
var defaultCollection = "AccessLog";
var defaultURL = 'mongodb://user:Root12345@9.123.197.164:27017/UserTrack';

function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	res.write(callback+'(');
	res.write(JSON.stringify(data));
	res.end(');');
}

function dataRecord(req, res, query){
	if(res){
		try{
			_mongo.connect(defaultURL, function(err,conn){
				if(err)console.error(err);
				newConn = conn.db(defaultDB);
				var coll = newConn.collection(defaultCollection);
				coll.insert({id:query.id,ip:query.ip,time:Date(),screen:query.screen,color:query.color,platform:query.platform,userAgent:query.userAgent,url:req.url,referrer:query.referrer,userId:query.userId,title:query.title,pageTitle:query.pageTitle},function(err,result){					
					JSONP(res, result, query.callback);
					conn.close();
				});
			});
		}catch(ex){
			res.writeHead(500, {'Content-Type':'text/plain;charset=utf-8'});
			res.write(callback+'({"ExceptionName":');
			res.write('"'+ex.name+'","ExceptionMessage:"'+ex.message+'"');
			res.end('});');	
		}
		
	}else{
		res.end();
	}
}

_http.createServer(function(req,res){
	var params = _url.parse(req.url,true);
	var query = params.query;
	
	if (params.pathname == '/UserTrackService/track/DataCollect'){
		dataRecord(req,res, query);
	} else{
		res.writeHead(501,{'Content-Type':'text/plain;charset=utf-8'});
		res.end();
	}
}).listen(8181,'9.123.197.164');

