var request = require('request');
var url = require('url');

function GetAPI(baseURL) {
	this.baseURL = baseURL;
}

GetAPI.prototype.getURL = function (dataURL, callback) {
	dataURL = url.resolve(this.baseURL, dataURL);
	request.get({
		url: dataURL,
		json: true
	}, callback || function () {});
};

GetAPI.prototype.child = function (childName) {
	var push = function (data, callback) {
		// Gotta make sure there's a slash at the end for a collection
		var collectionURL = url.resolve(this.baseURL, '/s/' + childName)
			.replace(/([^\/]{1}$)/g, '$1/');
		request.post({
			url: collectionURL,
			json: data
		}, callback || function () {});
	}.bind(this);

	var update = function (data, callback) {
		if (!data.links || !data.links.self) {
			throw new Error("The object you're trying to update has no self link, so it cannot be saved.");
		}

		var itemURL = url.resolve(this.baseURL, data.links.self);
		request.put({
			url: itemURL,
			json: data.content
		}, callback || function () {});
	}.bind(this);

	var updateOrPush = function (data, callback) {
		if (!data.links || !data.links.self) {
			return push(data.content, callback);
		}

		return update(data, callback || function () {});
	}.bind(this);

	return {
		push: push,
		update: update,
		updateOrPush: updateOrPush,
	};
};

module.exports = GetAPI;
