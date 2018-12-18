jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
    "sap/ui/test/Opa5",
    "sap/ui/test/opaQunit",
    "sap/ui/test/OpaPlugin"
], function(Opa5, opaTest, OpaPlugin) {
    "use strict";

	//############################
	//###START GENERAL SETTINGS###
	//############################

	var testPollingInterval = 1000;
	
	//START EXTRACT URL PARAMS
    Opa5.extendConfig({
        autoWait: false,
        timeout: testTimeout,
        pollingInterval: testPollingInterval,
        scrolltop: false
    });
	
	QUnit.testStart(function( details ) {
	  //Hide all Rerun Buttons (temporary)
	  $('a:contains("Rerun")').hide();
	  console.warn( "[FLPTESTER] [TEST BEGIN] ["+details.name+"]");
	});
	
	QUnit.testDone(function( details ) {
	  console.warn( "[FLPTESTER] [TEST DONE] ["+details.name+"]");
	  formatOutput();
	});
	
	QUnit.done( ( { total, failed, passed, runtime } ) => {
	  console.warn("[FLPTESTER] [END]");
	  formatOutput();
	});
    
    var testApp = "";
    
	//############################
    //###END GENERAL SETTINGS###
	//##########################

	var testLocalTMP = getParameterByName('testLocal');
    if (testLocalTMP){
    	testLocal = (testLocalTMP == 'true');
    }
    
    var logLevelTMP = getParameterByName('logLevel');
    if (logLevelTMP){
    	logLevel = logLevelTMP;
    }

    var myurl = "test/FioriLaunchpad.html?";
    if (!testLocal) {
        myurl = "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-language=EN";
    }

    var urlparams = "";

    //DETERMINE SLEEP/DELAY
    var waiting1;
    var waiting2;
    var waiting3;
    var interval;
    
    var myerrors = [];
    
    var timer1;
    var timer2;
    
    var XHRPendingRequests = [];
    var XHRFinishedRequests = [];
    
    var lastDOMEvent;
    
    //START EXTRACT URL PARAMS
	var url = window.location.href;
    if (url && url.indexOf("testApp=") >= 0) {
        var tmpapp = url.split("testApp=")[1];

        if (tmpapp !== "") {
            testApp = tmpapp;
            if (testApp.includes("#")) {
	                testset.push({
	                    appid: testApp,
	                    desc: "Single App Launch"
	                });
            }
        }
    }
    //END EXTRACT URL PARAMS
    
    //RESET SLEEP/DELAY TIMER
    function reset() {
        myerrors = [];
        
        waiting1 = 0;
        waiting2 = 0;
        waiting3 = 0;
        interval = 10; //pollingInterval x 10 = XX s
        XHRPendingRequests = [];
        XHRFinishedRequests = [];
        
        $("#OpaFrame").css("border-bottom","0px");
        lastDOMEvent = null;
    }
    
    function collectError(severity, theerror)
    {
    	if (!StringInArray(theerror, myerror_excludes)) 
    	{
	    	var err = new Object();
	    	err.severity = severity;
	    	
	    	//remove whitespace start & end
	    	theerror = theerror.trim();
	    	
	    	//remove timestamp
	    	if(theerror.substring(0,4) == (new Date()).getFullYear())
	    	{
	    		if(theerror.length > 27)
	    		{theerror = theerror.substring(27,theerror.length);}
	    	}
	    	
	    	//remove callstack
	    	var n = theerror.indexOf("Callstack:");
	    	if(n > 0)
	    	{
	    		theerror = theerror.substring(0,n);
	    	}
	    	
	    	var n = theerror.indexOf("Check function is:");
	    	if(n > 0)
	    	{
	    		theerror = theerror.substring(0,n);
	    	}
	    	
	    	if(IsNoDuplicate(myerrors, "desc", theerror))
	    	{
		    	err.desc = theerror;
		    	err.timestamp = new Date().toJSON();
		    	myerrors.push(err);
	    	}
    	}
    }
    
    function stateChange(){
    	
        var oXHR = this;
        var mystatus = oXHR.status.toString();
        
        if (oXHR.readyState === 3) 
        {
            if(mystatus.charAt(0) == "4" || mystatus.charAt(0) == "5") //CAPTURE ALL 4xx or 5xx HTTP Errors
            {
            	if(oXHR.url.includes("odata") && !oXHR.url.includes("ESH_SEARCH_SRV") && !oXHR.url.includes("INTEROP") && !oXHR.url.includes("CA_FM_FEATURE_TOGGLE_STATUS_SRV"))
            	{collectError("High", "Failed to load resource '" + oXHR.url + "' Status "+oXHR.status+" (" + oXHR.statusText + ")");}
            	else
            	{collectError("Medium", "Failed to load resource '" + oXHR.url + "' Status "+oXHR.status+" (" + oXHR.statusText + ")");}
            }
        }
        
        if(oXHR.readyState === 4)
        {
			if(mystatus.charAt(0) == "4" || mystatus.charAt(0) == "5") //CAPTURE ALL 4xx or 5xx HTTP Errors
            {
            	if(oXHR.url.includes("odata") && !oXHR.url.includes("ESH_SEARCH_SRV") && !oXHR.url.includes("INTEROP") && !oXHR.url.includes("CA_FM_FEATURE_TOGGLE_STATUS_SRV"))
            	{collectError("High", "Failed to load resource '" + oXHR.url + "' Status "+oXHR.status+" (" + oXHR.statusText + ")");}
            	else
            	{collectError("Medium", "Failed to load resource '" + oXHR.url + "' Status "+oXHR.status+" (" + oXHR.statusText + ")");}
            }
        	
        	XHRFinishedRequests.push(oXHR);
        }
    }

    
    function registerXHROverride() {
		
		var xhrm = Opa5.getWindow().sap.ui.require('sap/ui/performance/XHRInterceptor');
		
		//FALLBACK IN CASE NOT AVAILABLE
		if(!xhrm)
		{
	        Opa5.getWindow().jQuery.sap.registerModulePath('sap.ui.performance', document.location.pathname+'/../');
	        xhrm = Opa5.getWindow().sap.ui.requireSync('sap/ui/performance/XHRInterceptor');
		}

		if(xhrm)
		{
			xhrm.register("FLPTESTER", "open", function() 
			{
				if(this.url.includes("odata"))
				{
					XHRPendingRequests.push(this.id);
					this.addEventListener("readystatechange", stateChange);
				}
			});
		}
		else
		{
			console.error("[FLPTESTER] [ERROR] Could not load XHRInterceptor");
		}
    }
    
    function writeConsole(severity, message)
    {
    	if(logLevel > 0 && severity == "INFO")
    	{
    		console.log("[FLPTESTER] [INFO] "+message)
    	}
    }

    //CAPTURE ERRORS FROM IFRAME
    function takeOverConsole() {
        var mywindow = Opa5.getWindow();
        var console = mywindow.console;
        if (!console) {
            return;
        }

        function intercept(method) {
            var original = console[method];
            console[method] = function() {
                // do sneaky stuff
                if (method == "error") {
                	if(StringInArray(arguments[0], myerror_high) && !StringInArray(arguments[0], myerror_medium))
                	{collectError("High", " " + arguments[0]);}
                	else
                	{collectError("Medium", " " + arguments[0]);}
                }

                if (original.apply) {
                    // Do this for normal browsers
                    original.apply(console, arguments);
                } else {
                    // Do this for IE
                    var message = Array.prototype.slice.apply(arguments).join(' ');
                    original(message);
                }
            };
        }
        var methods = ['log', 'info', 'warn', 'error'];
        for (var i = 0; i < methods.length; i++) {
            intercept(methods[i]);
        }
    }
    
    function navToApp(hash)
    {
    	var oCrossAppNavigator = Opa5.getWindow().sap.ushell.Container.getService("CrossApplicationNavigation");
        oCrossAppNavigator.toExternal({
            target: {
                shellHash: hash
            }
        });
        console.log("[FLPTESTER] [INFO] Navigated to "+hash)
    }
    
    //CHECK FOR BUSY INDICATORS
    function checkBusyIndicators()
    {
    	var busyindicators_visible = [];
    	
    	var sel = Opa5.getWindow().jQuery(".sapUiComponentContainer .sapMBusyIndicator, .sapUiComponentContainer .sapUiLocalBusyIndicator");

    	sel.each(function() {
			if(Opa5.getWindow().jQuery(this).is(":visible"))
    		{
    			busyindicators_visible.push($(this));
    		}
		});

    	return busyindicators_visible.length;
    }
    
    function initDOMObserver(){
    	
    	MutationObserver = sap.ui.test.Opa5.getWindow().MutationObserver || sap.ui.test.Opa5.getWindow().WebKitMutationObserver;

		var observer = new MutationObserver(function(mutations, observer) {

		    writeConsole("INFO","DOM Event detected!");
		    
		    lastDOMEvent = window.performance.now();
		});
		
		observer.observe(sap.ui.test.Opa5.getWindow().document, {
		  subtree: true,
		  attributes: true
		});
    	
    }
    
    function CategorizeIssues(myissues){
    	
    	var k = 0;
        var myissues_cat = new Object();
        myissues_cat.High = [];
        myissues_cat.Medium = [];
        myissues_cat.Low = [];
        
        jQuery.each(myissues, function(k, issue) {
            if (issue.severity == "High") {
                myissues_cat.High.push(issue);
            }
            if (issue.severity == "Medium") {
                myissues_cat.Medium.push(issue);
            }
            if (issue.severity == "Low") {
                myissues_cat.Low.push(issue);
            }
        });
        
        return myissues_cat;
    }
    
    function getAppInfo(currentApp)
    {
    	/*var oAppLifeCycle = Opa5.getWindow().sap.ushell.Container.getService("AppLifeCycle");
    	var currentApp = oAppLifeCycle.getCurrentApplication();
    	console.log("[FLPTESTER] [WARNING] "+JSON.stringify(currentApp));
    	*/
    	
    	Opa5.assert.ok(true, "App Info: ##OUTPUT##"+JSON.stringify(currentApp,null, 4));
    	
    	if(currentApp.ui5_component)
    	{Opa5.assert.ok(true, "App Manifest: ##URL##"+location.origin+"/sap/bc/ui2/app_index?fields=descriptor&sap.app/id="+currentApp.ui5_component);}
    }

    QUnit.module("Init Fiori Launchpad - Script Version "+version);

    opaTest("#Shell-home", function(Given, When, Then) {

        Given.iStartMyAppInAFrame(myurl + urlparams);

        reset();

        When.waitFor({
            id: "meAreaHeaderButton",
            success: function(oControl) {
                Opa5.assert.ok(true, "FLP loaded successfully!");
            },
            errorMessage: "Did not find FLP!"
        });

        When.waitFor({
            success: function(oControl) {
            	
				if (testset.length == 0) {
					var done_cat = Opa5.assert.async();
                	var assert_cat = Opa5.assert;
					getAllIntents(assert_cat, done_cat);
				}

                takeOverConsole();
		        registerXHROverride();
		        initDOMObserver();
            },
            errorMessage: "Could not load Catalogs!"
        });
        
        Then.waitFor({
        	pollingInterval: 10000,
        	check: function(oControl) {
				if(this.done)
				{this.done = false; return true;}
				else
				{this.done = true;return false;}
        	},
            success: function(oControl) {
                Opa5.assert.ok(true, "Slept 10s!");
                
                TestSuite(testset);
            },
            errorMessage: "Could not sleep!"
        });
    });

    function TestSuite(myapps) {
    	
        //DISPLAY COUNT
        var totalapps = myapps.length;
        console.warn("[FLPTESTER] [WARNING] Total Apps to be tested: " + totalapps);
        console.warn(myapps);
        
        jQuery.each(myapps, function(k, myapp) {
            var mycurrentapp = k + 1;
            var context = mycurrentapp + "/" + totalapps;
            var context_ext = myapp.appid;
            
            QUnit.module(context);

            opaTest(context_ext, function(Given, When, Then) {
            	
			    if(abortTest)
            	{
            		QUnit.stop();
            		console.warn("[FLPTESTER] [WARNING] Test aborted by user!");
            	}
            	
                reset();
                
                console.warn("[FLPTESTER] [TEST PROGRESS] "+context);

                //NAVIGATE TO APP
                var mypath = myapp.appid;
				
				//Fix Bug with URL Encoding: #ApplicationJob-show?/h4screen=SchedATPRunForPOs
				mypath = mypath.replace("/", "%252F");
				
                navToApp(mypath);
                
                getAppInfo(myapp);

                When.waitFor({
                    controlType: "sap.ui.core.ComponentContainer",
                    visible: true,
                    check: function(oControl) {
                    	
                    	var done = false;
                    	
                    	writeConsole("INFO","ODATA requests finished: "+XHRFinishedRequests.length+" / "+XHRPendingRequests.length);
                    	
                    	//HIGH ISSUE => DONE
                    	//XHR COMPLETED & > 0 => DONE
                    	//XHR = 0 & DOM READY => DONE
                    	//CHECK BUSY INDICATOR => DONE
                    	
                    	//ABORT IN CASE OF HIGH ISSUES
                    	var myissues = CategorizeIssues(myerrors);
                    	if(myissues.High.length > KPI_startup_errors_high_issues || myissues.Medium.length > KPI_startup_errors_medium_issues)
                    	{
                    		done = true;
                    	}
                    	else if(XHRFinishedRequests.length >= XHRPendingRequests.length && XHRPendingRequests.length > 0)
                        {
                        	writeConsole("INFO","Checking for Busy Indicators...");
                        	
                        	//CHECK FOR BUSY INDICATORS
                        	var bi = checkBusyIndicators();
                        	if(bi > 0)
                        	{
                        		writeConsole("INFO","Found "+bi+" Busy Indicators! Wait to finish...");
                        		done = false;
                        		
                        	}
                        	else
                        	{
                        		writeConsole("INFO","No Busy Indicators found!");
                        		done = true;
                        	}
                        }
                        else if (XHRPendingRequests.length == 0)
                        {
                        	var now = window.performance.now();
                        	var diff = (now - lastDOMEvent) / 1000;
                        	
                        	if(lastDOMEvent && diff > KPI_dom_timeout)
                        	{
                        		writeConsole("INFO","No DOM changes occured within last "+diff.toFixed(0)+"s!");
                        		done = true;
                        	}
                        	else
                        	{
                        		done = false;
                        	}
                        }
                        else
                        {
                        	done = false;
                        }
                        
                        if(done)
                        {
	                        if (waiting1 < interval ) {
	                            waiting1++;
	                            writeConsole("INFO","Waiting "+waiting1+" / "+interval);
	                            return false;
	                        } else {
	                            writeConsole("INFO","Waited " + waiting1 * testPollingInterval/1000 + " seconds!");
	                            return true;
	                        }
                        }
                        else
                        {
                        	return false;
                        }
                        
                    },
                    success: function(oControl) {

                    	//START APP LAUNCH
                    	var myissues = CategorizeIssues(myerrors);
                        
                        var summary = myissues.High.length + " High (" + myissues.Medium.length + " Medium " + myissues.Low.length + " Low)";

                        if (myissues.High.length <= KPI_startup_errors_high_issues && myissues.Medium.length <= KPI_startup_errors_medium_issues) {
                        	output_results(context_ext, "Startup", true, JSON.stringify(myerrors,null, 4));
                            Opa5.assert.ok(true, "App Startup successful without critical errors: "+summary+"##OUTPUT##"+JSON.stringify(myerrors,null, 4));
                        } else {
                        	output_results(context_ext, "Startup", false, JSON.stringify(myerrors,null, 4));
                            Opa5.assert.notOk(true, "App Startup with critical errors: "+summary+"##OUTPUT##"+JSON.stringify(myerrors,null, 4));
                        }
                        //END APP LAUNCH
                    },
                    error: function(oControl) {
                    	
                    	collectError("High", "Timeout of [60][s] reached, "+XHRFinishedRequests.length+" / "+XHRPendingRequests.length+" ODATA requests finished!");
                    	
                    	var bi = checkBusyIndicators();
                    	if(bi > 0)
                    	{
                    		collectError("High", "Found active busy indicator(s), which indicates a functional or performance issue!");
                    	}
                    	
                    	collectError("High", oControl.errorMessage);
                    	
                    	//output_results(context_ext, "Startup", false, JSON.stringify(myerrors,null, 4));
                        Opa5.assert.notOk(true, "App Startup with critical errors: "+JSON.stringify(myerrors,null, 4));
                    },
                    errorMessage: "App could not be started! Component Container not found!"
                });
                
                //START SLEEP
                Then.waitFor({
		        	pollingInterval: 5000,
		        	check: function(oControl) {
						if(this.done)
						{this.done = false;return true;}
						else
						{
							navToApp("#Shell-home");
		                	Opa5.assert.ok(true, "Navigated back to shell!");
							this.done = true;
							return false;
						}
		        	},
                    success: function(oControl)
                    {
                    	var control = sap.ui.test.Opa5.getWindow().sap.ui.getCore().byId("appContent");
                    	
                    	if(control)
                    	{
                    		console.log("[FLPTESTER] [INFO] appContent destroyed!");
                    		control.destroy();
                    	}
                    	
                    	Opa5.assert.ok(true, "Slept 5s!");
                    }
                });
                //END SLEEP
            });

        });
		
		if(totalapps > 0)
		{
        	Opa5.assert.ok(true, "SAPUI5 Apps to be tested (duplicates & blacklisted apps will be ignored): "+totalapps);
        	Opa5.assert.ok(true, "Catalogs/Apps loaded:##OUTPUT##"+JSON.stringify(myapps,null, 4));
        	
        	if(logLevel > 0)
        	{
        		output_results("SUMMARY", "CATALOGS", true, JSON.stringify(myapps,null, 4));
        		//output_results("SUMMARY", "BLACKLIST", true, JSON.stringify(myappscat_blacklisted,null, 4));
        	}
	        
	        QUnit.start();
		}
		else
		{
			Opa5.assert.notOk(true, "No apps found, test stopped!");
		}
    }

    QUnit.start();
});