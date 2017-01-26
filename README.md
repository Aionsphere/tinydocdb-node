# tinydocdb-node

tinydocdb-node is a tiny client for **DocumentDB**, it allows you to easily make REST calls to DocumentDB by taking care of the authentication headers and by the making the call for you.

Alone you can use this is a simple quick node.js module to access DocumentDB without doing any heavy lifting.

However it really becomes useful when you use it from services such as **Azure Mobile Apps** and **Azure Functions**.

Using it in these scenarios can not only simply DocumentDB access but it can also reduce the size of your requests, allow you to use different client authentication, and ***access DocumentDB from many platforms such as Native iPhone, Android and Cordova without the need for a specific platform SDK.***

## Installation

`npm install @MicrosoftTE/tinydocdb-node`
	
## Usage

    var tinydocdb = require('@microsoftte/tinydocdb-node');

	var mykey = 'YOUR DOCUMENT DB KEY';
	
	// Gets all databases, the forth parameter is the jsonBody which should always be empty for GET
    var allDatabases = tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/', mykey, 'GET', '');
	
	// Create a database
	var createDBResult =  tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/', mykey, 'POST', '{ "id" : "tempdb" }');

	// Create a collection
	var createCollectionResult =  tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls', mykey, 'POST', '{ "id" : "tempcoll" }');

	// Create a document
	var createDocumentResult =  tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs', mykey, 'POST', '{ "id" : "tempdoc", "tempdata" : "data!" }');
	
	// Get a document
	var getDocumentResult = tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs/tempdoc', mykey, 'GET', '');

	// Update a document
	var updateDocumentResult = tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs/tempdoc', mykey, 'PUT', '{ "id" : "tempdoc", "tempdata" : "updated data!" }');

	// Delete a document
	var deleteDocumentResult = tinydocdb('https://{databaseaccount}.documents.azure.com/dbs/tempdb/colls/tempcoll/docs/tempdoc', mykey, 'DEL', '');

These are just examples of what you can do, you can access all of the resources available through the REST interface in this way by simply changing the URI.

The URI syntax for all DocumentDB REST calls is provided here :  https://docs.microsoft.com/en-us/rest/api/documentdb/documentdb-resource-uri-syntax-for-rest

