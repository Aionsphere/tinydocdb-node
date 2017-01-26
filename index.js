// tinydocdb-node - TinyDocDB is a node.js wrapper for DocumentDB REST APIs by Steve Lindsay (@MicrosoftTE)
// github : https://github.com/MicrosoftTE/tinydocdb-node
// homepage : https://microsoftte.github.io/
// license : MIT

/**
 * Expose `tinydocdb(documentDBUri, sharedkey, verb, jsonBody)`.
 */
module.exports = tinydocdb;

/**
 * tinydocdb wraps up documentdb calls so you can call a resource quickly without having to worry 
 * about anything but the URI, key, verb and json body (for queries or posts)
 *   
 *  Returns an object containing:
 * 
 *    statusCode : an integer representing the success of the call, 0 is success, any other value is failure
 *    errorDescription : if statusCode is 0, this will be an empty string, if not 0 it  will contain an error description
 *    jsonResponse : the JSON response body returned from the DocumentDB call.
 * 
 *  @param {string} documentDBUri
 *  @param {string} sharedkey
 *  @param {string} verb
 *  @param {string} jsonBody
 *  @return {object}
 */
function tinydocdb(documentDBUri, sharedkey, verb, jsonBody) {
    
    // Verify we received a valid verb and return an error if we didn't
    var verifyVerbResult = verifyVerb(verb);
    if (verifyVerbResult.statusCode != 0) {
        return { statusCode : verifyVerbResult.statusCode, errorDescription : verifyVerbResult.errorDescription, jsonResponse : "{}"};
    }

    // Verify we received a valid URI and get the url parts in an object, return an error if we didn't have a valid URI
    var urlParts = verifyAndReturnURLParts(documentDBUri);
    if (urlParts.statusCode != 0) {
        return { statusCode : urlParts.statusCode, errorDescription : urlParts.errorDescription, jsonResponse : "{}"};
    }

    // Verify we have a valid resource path and return an object containing the resource type and id, return an error if parsing failed
    var resourceInfo = getResourceInfo(path);
    if (resourceInfo.statusCode != 0) {
        return { statusCode : resourceInfo.statusCode, errorDescription : resourceInfo.errorDescription, jsonResponse : "{}" };
    }

    // Use the crypto API to generate a new base64 signature for our request, the signature is generated dynamically based on the request.
    var crypto = require("crypto");
    var key = new Buffer(mastKey, "base64");
    var date = generateRFC1123Date();
    var requesttext = (verb || "").toLowerCase() + "\n" + (resourceInfo.resourceType || "").toLowerCase() + "\n" + 
        (resourceInfo.resourceId || "") + "\n" + (date || "").toLowerCase() + "\n" + "" + "\n";
    var signature = crypto.createHmac("sha256", key);
    signature.update(requesttext);
    var base64Bits = signature.digest("base64"); 

    // We create our authentication token and URI encode it
    var MasterToken = "master";
    var TokenVersion = "1.0";
    var authToken = encodeURIComponent("type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + base64Bits);

    // Setup our outbound REST call to DocumentDB setting the authentication token and date in the headers
    var http = require("https");
    var options = {
        "method": verb,
        "hostname": UrlParts.host,
        "port": UrlParts.port,
        "path": UrlParts.path + UrlParts.file,
        "headers": {
            "accept": "application/json",
            "x-ms-version": "2015-12-16",
            "authorization": authToken,
            "x-ms-date": UTCtime,
            "cache-control": "no-cache"
        }
    };
        
    // Make our request and return the result
    var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
            var body = Buffer.concat(chunks);
            return { 
                statusCode : 0, 
                errorDescription : "", 
                jsonResponse : body 
            };
            // response.status(200).type('application/json').send(body);
        });
    });
}

/**
 * Parse then verify the URI parts and return them in an object if possible.
 * 
 *    statusCode : an integer representing the success of the call, 0 is success, any other value is failure
 *    errorDescription : if statusCode is 0, this will be an empty string, if not 0 it  will contain an error description
 * 
 *    Example of use:
 * 
 *       var urlParts = parseAndReturnURLParts(url)
 *       if (urlParts.statusCode == 0) {
 *          var protocol = urlParts.Protocol;
 *          var host = urlParts.Host;
 *          var port = urlParts.Port;
 *          var path = urlParts.Path;
 *          var file = urlParts.File;
 *       }
 * 
 *  @param {string} url
 *  @return {object}
 */
function verifyAndReturnURLParts(url)
{
    var errorText = "";
    var statusCode = 0;
    var PROTOCOL = 2, HOST = 3, PORT = 5, PATH = 6, FILE = 8, QUERYSTRING = 9, HASH = 12;
    var re = new RegExp("^((https):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$", "i");
    var match = re.exec(inputuri);
    return { 
        statusCode : statusCode, 
        errorDescription : errorText, 
        protocol : match[PROTOCOL], 
        host: match[HOST], 
        port: match[PORT], 
        path: match[PATH], 
        file: match[FILE] 
    };
}

/**
 * Verifies that the verb passed is GET, POST, PUT or DEL
 *
 *   Returns an object containing:
 *    
 *      statusCode : an integer representing the success of the call, 0 is success, any other value is failure
 *      errorDescription : if statusCode is 0, this will be an empty string, if not 0 it  will contain an error description
 *    
 *    Example of use:
 *          
 *          var verifyVerbResult = verifyVerb(verb);
 *          if (verifyVerbResult.statusCode != 0) {
 *              // Error verb was not a valid option (GET,POST,PUT,DEL)
 *              var errorDesc = verifyVerbResult.errorDescription;
 *          }
 *
 * @param {string} verb
 * @return {object}
 */
function verifyVerb(verb)
{
    var statusCode = 0;
    var errorDescription = "";
    var validVerb = (verb == "GET" || verb == "POST" || verb == "PUT" || verb == "DEL") ? true : false;
    if (!validVerb) {
        statusCode = -1;
        errorDescription = "Invalid verb, options are GET, POST, PUT and DEL";
    }
    return { 
        statusCode : statusCode, 
        errorDescription : errorDescription 
    };
}

/**
 * Given a path for a DocumentDB REST path, return the type of resource and the resource id
 *    Returns an object containing:
 *    
 *      statusCode : an integer representing the success of the call, 0 is success, any other value is failure
 *      resourceId : a string containing the Resource ID of the DocumentDB resource
 *      resourceType : a string containing the Resource Type of the DocumentDB resource
 *      errorDescription : if statusCode is 0, this will be an empty string, if not 0 it  will contain an error description
 *    
 *    Example of use:
 * 
 *          var resourceInfo = getResourceInfo('/dbs/tempdb');
 *          if (resourceInfo.statusCode == 0) {
 *              var resourceID = resourceInfo.resourceId;
 *              var resourceType = resourceInfo.resourceType;
 *          } else {
 *              var errorDescription = resourceInfo.errorDescription;
 *          }
 * 
 * @param {string} path 
 * @return {object}
 */
function getResourceInfo(path) {
    // push the parts down into an array so we can determine if the call is on a specific item
    // or if it is on a resource (odd will mean a resource, even will mean an item)
    var strippedparts = strippedpath.split("/");
    var truestrippedcount = (strippedparts.length - 1);
    var resType = "";
    var resId = "";

    if (truestrippedcount % 2) { // if it's odd (resource request)
        // assign resource type to the last part we found.
        resType = strippedparts[truestrippedcount];
        if (truestrippedcount > 1) {
            // now pull out the resource id by searching for the last slash and substringing to it.
            var lastPart = strippedurl.lastIndexOf("/");
            resId = strippedurl.substring(1,lastPart);
        }
    } else { // if it's even (item request on resource)
        // assign resource type to the part before the last we found (last is resource id)
        resType = strippedparts[truestrippedcount - 1];
    }

    return { 
        statusCode: 0, 
        resourceId:resId, 
        resourceType:resType, 
        errorDescription:""
    };
}

/**
 * Generates a date in RFC1123 format for the x-ms-date header required by a DocumentDB call.
 *
 *    Example of use:
 * 
 *          var dateheader = generateRFC1123Date();
 *
 * @return {object}
 */
function generateRFC1123Date() {
    var today = new Date();
    rfc1123date = today.toUTCString();
    return rfc1123date;
}

