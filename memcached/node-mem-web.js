var _http = require('http');
var _url = require('url');
var nMemcached = require( 'memcached' );
var memcached = new nMemcached("9.123.197.164:11211",{poolSize:50} );

function JSONP(res, data, callback){
	res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
	res.write(callback+'(');
	res.write(JSON.stringify(data));
	res.end(');');
}

function setMem(res, key, value, num, callback){
	if(key && value){
		try{
			memcached.set( key, value, 600, function( err, result ){
				var setResult = "Result : ";
				if( err ) {
					console.error( err );
					setResult+=err;
				}
				if( result ){
					console.dir( key + "=" + value +"," );
					//setResult = setResult + "\""+key + "\":\"" + value + "\"";
					setResult = setResult +key + ":" + value;
				}else {
					console.dir("Set failed!");
					setResult += "Set failed!";
				}
				memcached.end();
				console.dir("\ncallback : "+callback+"\n");
				JSONP(res, setResult, callback);
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
	
	if (params.pathname == '/memcache/set'){
		setMem(res, query.key, query.value, query.num, query.callback);
	} else{
		res.writeHead(501,{'Content-Type':'text/plain;charset=utf-8'});
		res.end();
	}
}).listen(8090,'9.123.197.164');

