/* A wrapper of XMLHttpRequest, adding some functionality and dealing with
	asynchronism with Futures.
*/
var HttpRequest = exports.HttpRequest = declare({ 
	/** new HttpRequest():
		A wrapper for XMLHttpRequest.
	*/
	constructor: function HttpRequest() {
		this.__request__ = new XMLHttpRequest();
	},
	
	/** HttpRequest.request(method, url, content, headers, user, password):
		Opens the request with the given method at the given url, sends the
		contents and returns a future that gets resolved when the request is
		responded.
	*/
	request: function request(method, url, content, headers, user, password) {
		var xhr = this.__request__,
			future = new Future();
		xhr.open(method, url, true, user, password); // Always asynchronously.
		if (headers) {
			Object.getOwnPropertyNames(headers).forEach(function (id) {
				xhr.setRequestHeader(id, headers[id]);
			});
		}
		// See <http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp>.
		xhr.onreadystatechange = function () { 
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					future.resolve(xhr);
				} else {
					future.reject(xhr);
				}
			}
		};
		xhr.send(content);
		return future;
	},
	
	/** HttpRequest.get(url, content, headers, user, password):
		Shortcut for a request with the GET method.
	*/
	get: function get(url, content, headers, user, password) {
		return this.request('GET', url, content, headers, user, password);
	},
	
	/** HttpRequest.getText(url, content, headers, user, password):
		Makes a GET request and returns the response's text.
	*/
	getText: function getText(url, content, headers, user, password) {
		return this.get(url, content, headers, user, password).then(function (xhr) {
			return xhr.responseText;
		});
	},
	
	/** HttpRequest.getJSON(url, content, headers, user, password):
		Makes a GET request and parses the response text as JSON.
	*/
	getJSON: function getJSON(url, content, headers, user, password) {
		return this.get(url, content, headers, user, password).then(function (xhr) {
			return JSON.parse(xhr.responseText);
		});
	},
	
	/** HttpRequest.post(url, content, headers, user, password):
		Shortcut for a request with the POST method.
	*/
	post: function post(url, content, headers, user, password) {
		return this.request('POST', url, content, headers, user, password);
	},
	
	/** HttpRequest.postJSON(url, content, headers, user, password):
		Makes a POST request with the content encoded with JSON.stringify().
	*/
	postJSON: function postJSON(url, content, headers, user, password) {
		headers = headers || {};
		headers['Content-Type'] = "application/json";
		return this.post(url, JSON.stringify(content) || 'null', headers, user, password);
	}	
}); // declare HttpRequest.

// Generate static versions of HttpRequest methods.
['request', 'get', 'getJSON', 'getText', 'post', 'postJSON'
].forEach(function (id) {
	HttpRequest[id] = function () {
		return HttpRequest.prototype[id].apply(new HttpRequest(), arguments);
	};
});