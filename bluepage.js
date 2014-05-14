var _http = require('http');
var _url = require('url');
var _mongo = require('/opt/node/node-v0.10.3-linux-x64/bin/node_modules/mongodb/lib/mongodb');

var bpHost = "9.123.197.164";
var bpPort = 27017;
var bpDBName = "BluePageCache";
var empColName = "employee";

var defaultDB = "BluePageCache";
var defaultCollection = "employee";
var defaultURL = 'mongodb://user:Root12345@9.123.197.164:27017/BluePageCache';

var bpServer = new _mongo.Server(bpHost, bpPort, {poolSize:10});
var bpDB = new _mongo.Db(bpDBName, bpServer, {});
var tmpDB;
bpDB.open(function(err,db){
	console.log('DB connected.');
	bpDB.authenticate('user','Root12345', function(err, result){
		if(result){
			console.log('Auth ok.');
		}
	});
});


function getEmployeeFuzzy(res, key, num, callback){
	if(key){
		try{
			var field = new RegExp('^'+key);
			bpDB.collection(empColName, function(err, empCol){
			empCol.find({$or:[{cnum:field},{name:field},{notes:field},{mail:field}]}, 							{limit:num}).toArray(function(err, docs){
					JSONP(res, docs, callback);
				});
			});
		}catch(ex){
			errorMsg(res, ex);
		}
	}else{
		res.end();
	}
}

function getEmployeeByCnum(res, cnum, callback){
	if(cnum){
		try{
			bpDB.collection(empColName, function(err, empCol){
			empCol.find({"cnum":cnum}).toArray(function(err, docs){
					JSONP(res, docs, callback);
				});
			});
		}catch(ex){
			errorMsg(res, ex);
		}
	}else{
		res.end();
	}
}

function errorMsg(res, ex){
	res.writeHead(500, {'Content-Type':'text/plain;charset=utf-8'});
	res.write('{"ExceptionName":');
	res.write('"'+ex.name+'","ExceptionMessage:"'+ex.message+'"');
	res.end('};');
}

function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	if(callback){
		res.write(callback+'(');
		res.write(JSON.stringify(data));
		res.end(');');
	}else{
		res.end(JSON.stringify(data));
	}	
}

function getEmployeeFuzzyOneConnection(res, key, num, callback){
	if(key){
		try{
			_mongo.connect(defaultURL, function(err,conn){
				newConn = conn.db(defaultDB);
				var coll = newConn.collection(defaultCollection);
				var field = new RegExp('^'+key);
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
	var params = _url.parse(req.url, true);
	var query = params.query;
	if (params.pathname == '/bluepage/employee/fuzzy'){
		getEmployeeFuzzy(res, query.key, query.num, query.callback);
	} else if (params.pathname == '/bluepage/employee/cnum'){
		getEmployeeByCnum(res, query.cnum, query.callback);
	} else {
		res.writeHead(501,{'Content-Type':'text/plain;charset=utf-8'});
		res.end();
	}
}).listen(8081,'9.123.197.164');

