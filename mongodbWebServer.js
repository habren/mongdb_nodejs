var _http = require('http');
var _url = require('url');
var _mongo = require('/opt/node/node-v0.10.3-linux-x64/bin/node_modules/mongodb/lib/mongodb');

function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	res.write(callback+'(');
	res.write(JSON.stringify(data));
	res.end(');');
}
function exceptionProcess(res, ex, callback){
	res.writeHead(500, {'Content-Type':'text/plain;charset=utf-8'});
			res.write(callback+'({"ExceptionName":');
			res.write('"'+ex.name+'","ExceptionMessage:"'+ex.message+'"');
			res.end('});');	
}

function listdb(res, url, callback){
	if(url && callback){
		try{
			_mongo.connect(url, function(err,conn){
				conn.command({'listDatabases':1},function(err,data){
					JSONP(res, data, callback);
					conn.close();
				});
			});
		}catch(ex){
			exceptionProcess(res, ex, callback);
		}
	}else{
		res.end("All parameters can't be empty!");
	}
}
function listCollection(res, url, db, callback){
	if(url && callback && db){
		try{
			_mongo.connect(url, function(err,conn){
				newConn = conn.db(db);
				newConn.collectionNames(function(err,data){
					JSONP(res, data, callback);
					conn.close();
				});
			});
		}catch(ex){
			exceptionProcess(res, ex, callback);
		}
	}else{
		res.end("All parameters can't be empty!");
	}
}
function listData(res, url, db, collection, startNum, callback){
	if(url && db && collection && callback){
		try{
			_mongo.connect(url, function(err,conn){
				newConn = conn.db(db);
				var coll = newConn.collection(collection);
				coll.find({},{skip:startNum,limit:100}).toArray(function(err,docs){
					JSONP(res, docs, callback);
					conn.close();
				});
			});
		}catch(ex){
			exceptionProcess(res, ex, callback);
		}
	}else{
		res.end("All parameters can't be empty!");
	}
}
_http.createServer(function(req,res){
	var params = _url.parse(req.url,true);
	var query = params.query;
	
	if (params.pathname == '/mongodb/db'){
		listdb(res, query.url, query.callback);
	} else if (params.pathname == '/mongodb/collection'){
		listCollection(res, query.url, query.db, query.callback);
	} else if (params.pathname == '/mongodb/data'){
		listData(res, query.url, query.db, query.collection, query.startNum, query.callback);
	} else if (params.pathname == '/mongodb/list'){
		list(res, query.url, query.db, query.collection, query.callback);
	} else{
		res.writeHead(501,{'Content-Type':'text/plain;charset=utf-8'});
		res.end();
	}
}).listen(8080,'9.123.197.164');

