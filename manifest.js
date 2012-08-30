var debug = require('debug')('resolveme'),
	findme = require('findme'),
	_ = require('underscore'),
	resolveme = require('./'),
	reNameParts = /^(.*[\/\\])?([\w\-]+)(\.\d+\.\d+\.\d+)?\.?(.*)$/,
	reParsableExts = /(?:js|css)$/,
	reLeadingDot = /^\./,
	reLeadingSlash = /^[\/\\]/,
	fileSeparators = {
		js: '\n;',
		'default': '\n'
	};


function Manifest(name, basePath) {
	this.name = name;
	this.basePath = basePath || '';

	// initialise the items
	this.items = [];
}

Manifest.prototype = {
	add: function(content, path) {
		var targetPath = path.slice(this.basePath.length).replace(reLeadingSlash, ''),
			match = reNameParts.exec(targetPath) || [],
			data = {
				content: content,
				dependencies: [],
				fileType: (match[4] || '').toLowerCase(),
				name: match[2],
			},
			results;

		// add a path attribute to the data
		data.path = (match[1] || '') + data.name + (data.fileType ? '.' + data.fileType : '');

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

	get: function(name) {
		var matching = this.items.filter(function(item) {
			return item.path.toLowerCase() === name.toLowerCase();
		});

		return matching[0];
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

		return contents.join(getFileSeparator(fileType));
	}
};

Object.defineProperty(Manifest.prototype, 'paths', {
	get: function() {
		return _.pluck(this.items, 'path');
	}
});

Object.defineProperty(Manifest.prototype, 'fileTypes', {
	get: function() {
		return _.uniq(_.pluck(this.items, 'fileType').sort(), true);
	}
});

/* helper functions */

function getFileSeparator(fileType) {
	return fileSeparators[fileType] || fileSeparators['default'];
}

/* exports */

exports.Manifest = Manifest;
exports.getFileSeparator = getFileSeparator;