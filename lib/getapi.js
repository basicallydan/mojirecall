var request = require('request');
var url = require('url');

function GetAPI(baseURL) {
	this.baseURL = baseURL;
}

GetAPI.prototype.child = function (childName) {
	return {
		push: function (data) {
			// Gotta make sure there's a slash at the end for a collection
			var collectionURL = url.resolve(this.baseURL, childName)
				.replace(/([^\/]{1}$)/g, '$1/');
			request.post({
				url: collectionURL,
				json: data
			});
		}.bind(this)
	};
};

module.exports = GetAPI;