var debug = require('debug')('resolveme'),
	findme = require('findme'),
	_ = require('underscore'),
	reNameParts = /^(?:.*\/)?([\w\-]+)(\.\d+\.\d+\.\d+)?\.?(.*)$/,
	reParsableExts = /(?:js|css)$/,
	reLeadingDot = /^\./;

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
				fileType: (match[3] || '').toLowerCase(),
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
		var contents = [];

		// if the filetype is not defined, and we only have one item use that filetype
		fileType = (fileType || (this.items[0] || {}).fileType)

			// convert to lowercase for consistency
			.toLowerCase()

			// remove the leading dot on the filetype if it is supplied
			.replace(reLeadingDot, '');

		// return the contents of each of the items matching the specified filetype
		this.items.forEach(function(item) {
			// if the item filetype matches the requested filetype add the content
			if (item.fileType === fileType) {
				contents.push(item.content);
			}
		});

		return contents.join('\n;');
	}
};

Object.defineProperty(Manifest.prototype, 'fileTypes', {
	get: function() {
		return _.uniq(_.pluck(this.items, 'fileType').sort(), true);
	}
});

module.exports = Manifest;