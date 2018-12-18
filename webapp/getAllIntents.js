var url = getSuffix();

var logger = function() 
{
	this.log = function(severity, content){
		console.log(content);
	};
};

var abapFLP = new utilsabapflp("FLPTESTER", new logger());

function getAllIntents(assert, done){

	$.get(url, function(jsonBody) {
	
	    //PROCESS DATA
	    var intents_full = abapFLP.getIntents(jsonBody);
	
	    //FILTER ARRAY
	    testset = intents_full.filter(abapFLP.filterByNotBlacklisted);
	    assert.ok(true, "FLP content successfully retrieved!");
	    done();
		
	}).fail(function() {
		assert.notOk(true, "FLP content could not be retrieved! Abort!");
		console.warn("[FLPTESTER] [ERROR] FLP content could not be retrieved! Abort");
		done();
	});

}