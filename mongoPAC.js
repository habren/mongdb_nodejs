var _http = require('http');
var _url = require('url');
var _mongo = require('/opt/node/node-v0.10.3-linux-x64/bin/node_modules/mongodb/lib/mongodb');

var defaultDB = "BluePageCache";
var defaultCollection = "employee";
var defaultURL = 'mongodb://user:Root12345@9.123.197.164:27017/BluePageCache';
function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	res.write(callback+'(');
	res.write(JSON.stringify(data));
	res.end(');');
}

function queryQuery(res, key, num, callback){
	if(key && callback){
		try{
			_mongo.connect(defaultURL, function(err,conn){
				newConn = conn.db(defaultDB);
				var coll = newConn.collection(defaultCollection);
				var field = new RegExp(key);
				coll.find({$or:[{cnum:field},{name:field},{notes:field},{mail:field}]},{limit:num}).toArray(function(err,docs){
					JSONP(res, docs, callback);
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
	
	if (params.pathname == '/mongodb/query'){
		queryQuery(res, query.key, query.num, query.callback);
	} else{
		res.writeHead(501,{'Content-Type':'text/plain;charset=utf-8'});
		res.end();
	}
}).listen(8081,'9.123.197.164');

