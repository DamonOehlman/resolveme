var debug = require('debug')('resolveme'),
	fs = require('fs'),
	path = require('path'),
	_exists = fs.exists || path.exists;

exports.exists = function(item, opts, callback) {
	debug('checking if item "' + item.name + '"" exists in local modules');

	_exists(path.resolve(opts.cwd, item.name), callback);
};

exports.download = function(item, opts, callback) {
	debug('retrieving item "' + item.name + '" from the local filesystem');
};