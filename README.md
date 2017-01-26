# tinydocdb-node

tinydocdb-node is a tiny client for **DocumentDB**, it allows you to easily make REST calls to DocumentDB by taking care of the authentication headers and by the making the call for you.

Alone you can use this is a simple quick node.js module to access DocumentDB without doing any heavy lifting.

However it really becomes useful when you use it from services such as **Azure Mobile Apps** and **Azure Functions**.

Using it in these scenarios can not only simply DocumentDB access but it can also reduce the size of your requests, allow you to use different client authentication, and ***access DocumentDB from many platforms such as Native iPhone, Android and Cordova without the need for a specific platform SDK.***

## Installation

`npm install tinydocdb-node`

	NOTE: To use in an Azure Mobile App, go to the App Service Editor and use the development console to install
		  To use in an Azure function, use Kudu to get to the console to install

## Usage

    var tinydocdb = require('tinydocdb-node');
	var mykey = 'YOUR DOCUMENT DB KEY';
	
	// Gets all databases, the forth parameter is the jsonBody which should always be empty for GET
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/', mykey, 'GET', '', function(result) { console.log(result); } );
	
	// Create a database
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/', mykey, 'POST', '{ "id" : "tempdb" }', function(result) { console.log(result); });

	// Create a collection
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls', mykey, 'POST', '{ "id" : "tempcoll" }', function(result) { console.log(result); });

	// Create a document
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs', mykey, 'POST', '{ "id" : "tempdoc", "tempdata" : "data!" }', function(result) { console.log(result); });
	
	// Get a document
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs/tempdoc', mykey, 'GET', '', function(result) { console.log(result); });

	// Update a document
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs/tempdoc', mykey, 'PUT', '{ "id" : "tempdoc", "tempdata" : "updated data!" }', function(result) { console.log(result); });

	// Delete a document
	tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs/tempdoc', mykey, 'DEL', '', function(result) { console.log(result); });

These are just examples of what you can do, you can access all of the resources available through the REST interface in this way by simply changing the URI.

The URI syntax for all DocumentDB REST calls is provided here :  https://docs.microsoft.com/en-us/rest/api/documentdb/documentdb-resource-uri-syntax-for-rest

