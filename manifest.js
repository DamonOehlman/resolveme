var debug = require('debug')('resolveme'),
	findme = require('findme'),
	_ = require('underscore'),
	reNameParts = /^(?:.*\/)?([\w\-]+)(\.\d+\.\d+\.\d+)?\.?(.*)$/,
	reParsableExts = /(?:js|css)$/;

function Manifest(name, basePath) {
	this.name = name;
	this.basePath = basePath || '';

	// initialise the items
	this.items = [];
}

Manifest.prototype = {
	add: function(content, path) {
		var match = reNameParts.exec(path.slice(this.basePath.length)) || [],
			data = {
				content: content,
				dependencies: [],
				fileType: match[3],
				name: match[1]
			},
			results;

		// if we have a file type that should be scanned for dependencies do that now
		if (reParsableExts.test(data.fileType)) {
			debug('parsing file for deps: ' + path);
			results = findme(data.content.toString('utf8'));

			data.content = results.content;
			data.dependencies = _.values(results.dependencies);
		}

		// if the item name matches the manifest name (e.g. underscore === underscore)
		// then unshift the data to the start of the array
		if (data.name === this.name) {
			this.items.unshift(data);
		}
		// otherwise, push it on the end
		else {
			this.items.push(data);
		}

		// return the data
		return data;
	},

	getContent: function(fileType) {
		console.log(_.pluck(this.items, 'fileType'));
	}
};

module.exports = Manifest;