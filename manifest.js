var debug = require('debug')('resolveme'),
	findme = require('findme'),
	_ = require('underscore'),
	resolveme = require('./'),
	regexes = require('./resolvers/regexes'),
	reParsableExts = /(?:js|css)$/,
	reLeadingDot = /^\./,
	reLeadingSlash = /^[\/\\]/,
	fileSeparators = {
		js: '\n;',
		'default': '\n'
	};


function Manifest(target, basePath) {
	// if the name is a string, then initialise the name from the string
	if (typeof target == 'string' || (target instanceof String)) {
		this.name = target;
	}
	else {
		_.extend(this, target);
	}

	// strip the invalid name parts from the name
	this.name = (this.name || '').replace(regexes.invalidNameParts, '');

	// initialise the basepath
	this.basePath = basePath || '';

	// initialise the items
	this.items = [];
}

Manifest.prototype = {
	add: function(content, path, force) {
		var targetPath = path.slice(this.basePath.length).replace(reLeadingSlash, ''),
			match = regexes.nameParts.exec(targetPath) || [],
			data = {
				content: content,
				dependencies: [],
				fileType: (match[4] || '').toLowerCase(),
				name: match[2]
			},

			// determine whether this file is a resource
			// at this stage this is determined on whether or not we 
			// can parse the file which matches js, css files only
			isResource = !reParsableExts.test(data.fileType),

			// determine whether the specified file is allowed to be added to the manifest
			// our initial check permits resources or files that exactly match the name
			// of the manifest, and additionally the third arg of this function provides
			// a mechanism for overriding all checks and adding the resource
			allowAdd = force || isResource || this.name.toLowerCase() === data.name.toLowerCase(),
			results;

		// add a path attribute to the data
		data.path = (match[1] || '') + data.name + (data.fileType ? '.' + data.fileType : '');

		// convert backslashes to forward slashes for resolving an item
		data.path = data.path.replace(/\\/g, '/');

		// checks to see if it should actually be added, we should only add the file if:
		//
		// - it's name is an exact match for the module name
		// - the name of the file is a match for a module selected specified in the target
		(this.modules || []).forEach(function(module) {
			allowAdd = allowAdd || new RegExp('^.*' + module + '\\..*$', 'i').test(data.path);
		});

		// if we are not allowed to add this file, then abort
		if (! allowAdd) return;

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