# SAP Fiori smoke test tool based on OPA5

Test automation tool for the startup of SAPUI5/Fiori Apps inside the SAP Fiori launchpad.

## Prerequisites

* SAP Fiori launchpad on SAP Netweaver ABAP
* SAPUI5 >= 1.48.x (e.g. >= S/4HANA 1709)

## Installation

* Download Code as .zip package to your local machine
* Unzip
* Go to se38 on Frontend Server / NW ABAP, run report: /UI5/UI5_REPOSITORY_LOAD
* Choose unzipped directory
* Specify Application name (e.g. zflptestermin), package (e.g. $tmp), transport request (can also be blank)
* Upload Files and finish wizard

### Run the tool

* Start the tool with the desired test user ideally in an own separate window via 
```
CUSTOM
http(s)://host:port/sap/bc/ui5_ui5/sap/zflptestermin/webapp/index.html
```

### Parameters

activates single app mode = only particular app is tested
> ?testApp=<#SemanticObject-Action>

allows testing in WebIDE (for now only works with testApp=...)
> ?testLocal=true&testApp=#Action-todefaultapp

\
**Note:** Parameters can be combined, but the "testApp" parameter must always be at the end of the url string\
\
Examples:
```
.../index.html?testApp=#WorkflowTask-displayInbox?scenarioId=SIV_RELEASE
```

## Supported Checks

SAPUI5/Fiori Apps only!!

1) App loaded successfully without HTTP 4x/5x ODATA and console errors:
```
Failed to resolve navigation target
is not compliant
Could not resolve navigation target
Could not open app
initial loading of metadata failed
oData metadata load failed
HTTP request failed
Failed to load UI5 component
The app has stopped working
```

## SUPPORT & CONTRIBUTION ##

This project is provided "as-is". There is no guarantee that raised issues will be answered or addressed in future releases.

If you like to contribute, fork the code and/or let me know!

## Screenshot

![DEMO](https://github.com/frumania/sap-flp-smoke-test-opa5/blob/master/docs/img/demo.png)

## Changelog

```
v. 1.00
Added Version & Changelog
```

## License

[![Apache 2](https://img.shields.io/badge/license-Apache%202-blue.svg)](./LICENSE.txt)
