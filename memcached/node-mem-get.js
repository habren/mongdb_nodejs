var nMemcached = require( 'memcached' ), memcached;
memcached = new nMemcached("9.123.197.164:11211" );
var startTime = new Date();
var start = startTime.getTime();
console.dir("Start : "+start);
var num=0;
for(var i=0; i<200000; i++){
	memcached.get( "hello"+i, function( err, result ){
		 num++;
 		 if( err ) console.error( err );
  		 console.dir( result );
		 console.dir(num);
		 if(num==200000){
			memcached.end();
			var stopTime = new Date();
			var stop = stopTime.getTime();
			console.dir("Total time : "+(stop-start)+"ms");
		 }
	});
}
