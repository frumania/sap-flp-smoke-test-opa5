var testset = [];
var module = {};
var version = "1.00";

var testLocal = false; //WebIDE only
var logLevel = 0; //0 = minimal, 1=info, 2=debug

var testTimeout = 60; //Timeout when single tests are aborted, regardless of state [seconds]
var KPI_startup_errors_high_issues = 0; //PLUS NO ODATA ERROR AND SEE myerror_high ARRAY
var KPI_startup_errors_medium_issues = 999; //NO ODATA ERROR AND SEE myerror_high ARRAY
var KPI_dom_timeout = 5.0; //[seconds]

var myerror_excludes = ["Cached changes", "Support rule with the id", "Support Assistant", ".support.js", "sap.ushell.services.Notifications", "Notification"];

var myerror_high = ["Failed to resolve navigation target:", "is not compliant", "Could not resolve navigation target", 
"Could not open app.", "initial loading of metadata failed", "oData metadata load failed", "HTTP request failed", "Failed to load UI5 component", 
"The app has stopped working"];

var myerror_medium = ["A draft exists already", "Invoice document   does not exist", "No plant with authorization found.",
"Please make an entry in all mandatory fields.", "SAML authentication failed.", "Is_modification_allowed", "Cannot modify as the system is currently set to read-only.", "Resource not found for the segment", "No site assigned.", "Failed to fetch cache tokens for the application", "SyntaxError: Unexpected token", 
"TypeError: Cannot read property", "Maintain area of responsibility"];