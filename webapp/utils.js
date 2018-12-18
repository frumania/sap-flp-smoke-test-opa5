//GENERATES BROWSER OUTPUT, USED FOR SELENIUM
function output_results(app, type, status, obj){
	console.warn('[FLPTESTER] [TEST RESULTS] ['+app+'] ['+type+'] ['+status+']: '+obj);
}

//EXTRACT URL PARAMETERS
function getParameterByName(name, url) 
{
    if (!url){url = window.location.href;}
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results){return null;}
    if (!results[2]){return '';}
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//CHECKS IF SEARCHTERM IS IN LIST/ARRAY
function StringInArray(searchterm, list) {
    for (var i = 0; i < list.length; i++) {
        if (searchterm.includes(list[i])) {
            return true;
        }
    }
    return false;
}

//CHECK FOR DUPLICATES
function IsNoDuplicate(list, listproperty, target)
{
	var found = true;
	for (var i = 0; i < list.length; i++) 
	{
		if(list[i][""+listproperty+""] == target)
		{found = false;}
	}
	return found;
}

function formatOutput(){
  $("span.test-message").each(function() 
  {
	  if($(this).text().includes("##OUTPUT##"))
	  {
	  	var res = this.innerHTML.split("##OUTPUT##");
	  	if(res.length > 0)
	  	{
	  		$(this).replaceWith($('<span>' + res[0] + '<pre>' + res[1] + '</pre></span>'));
	  	}
	  }
	  
	  if($(this).text().includes("##URL##"))
	  {
	  	var res = this.innerHTML.split("##URL##");
	  	if(res.length > 0)
	  	{
	  		$(this).replaceWith($('<span>' + res[0] + '<a href="'+res[1]+'" target="_blank">URL</a></span>'));
	  	}
	  }
	  
	  if($(this).text().includes("This is what Opa logged:"))
	  {
	  	var res = this.innerHTML.split("This is what Opa logged:");
	  	if(res.length > 0)
	  	{
	  		$(this).replaceWith($('<span>' + res[0] + '</span>'));
	  	}
	  }
	  
  });
}