var findme = require('findme'),
	_ = require('underscore'),
	reNameParts = /^.*\/([\w\-]+)\.?(.*)$/,
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
				fileType: match[2],
				name: match[1]
			};

		// if we have a file type that should be scanned for dependencies do that now
		if (reParsableExts.test(data.fileType)) {
			_.extend(data, findme(data.content.toString('utf8')));
		}

		// add the data
		this.items.push(data);
	}
};

module.exports = Manifest;