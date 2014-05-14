var _http = require('http');
var _url = require('url');
var _mongo = require('/opt/node/node-v0.10.3-linux-x64/bin/node_modules/mongodb/lib/mongodb');
//var url = 'mongodb://admin:Root1234@localhost:27017/admin';
function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	res.write(callback+'(');
	res.write(JSON.stringify(data));
	res.end(');');
}
function listCollection(res, url, db, callback){
	if(url && callback && db){
		_mongo.connect(url, function(err,conn){
			newConn = conn.db(db);
			newConn.collectionNames(function(err,data){
				JSONP(res, data, callback);
				conn.close();
			});
		});
	}else{
		res.end();
	}
}
function listdb(res, url, callback){
	if(url && callback){
		_mongo.connect(url, function(err,conn){
			conn.command({'listDatabases':1},function(err,data){
				JSONP(res, data, callback);
				conn.close();
			});
		});
	}else{
		res.end();
	}
}
function sampleData(res, url, db, collection, callback){
	if(url && db && collection && callback){
		_mongo.connect(url, function(err,conn){
			newConn = conn.db(db);
			newConn.colldection(collection, function(err,data){
				JSONP(res, data, callback);
				conn.close();
			});
		});
	}else{
		res.end();
	}
}
function sampleData(res){
	var url='mongodb://admin:Root1234@9.123.197.164:27017/admin';
	var db='GENDB';
	var callback='abc';
	var collection='G_EMP_HEADER';
	_mongo.connect(url, function(err,conn){
		newConn = conn.db(db);
		newConn.collection(collection, function(err, col){
			col.find().toArray(function(err, docs){
				JSONP(res, docs, callback);
				conn.close();
			});
		});
	});
}

_http.createServer(function(req,res){
	var params = _url.parse(req.url,true);
	var query = params.query;
	
	if (params.pathname == '/mongodb/db'){
		listdb(res, query.url, query.callback);
	} else if (params.pathname == '/mongodb/collection'){
		listCollection(res, query.url, query.db, query.callback);
	} else if (params.pathname == '/mongodb/data'){
		//sampleData(res, query.url, query.db, query.collection, query.callback);
		sampleData(res);
	}
}).listen(8080,'9.123.197.164');

