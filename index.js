var async = require('async'),
	findme = require('findme'),
	glob = require('glob'),
	events = require('events'),
	debug = require('debug')('resolveme'),
	fs = require('fs'),
	path = require('path'),
	semver = require('semver'),
	util = require('util'),
	reCommaDelim = /\,\s*/,
	reLeadingDot = /^\./,
	reSemVer = /^.*((?:\d+|x)\.(?:\d+|x)\.(?:\d+|x)).*$/,
	reSemVerAny = /(?:(\.)x(\.?)|(\.?)x(\.))/;

/* private helpers */

function parseTargets(targets) {
	if (typeof targets == 'string' || (targets instanceof String)) {
		targets = targets.split(reCommaDelim);
	}

	// ensure that each of the targets is a valid findme definition
	targets = targets.map(function(target) {
		if (! target.name) {
			target = new findme.Requirement(target);
		}

		return target;
	});

	return targets;
}

function versionSort(a, b) {
	return semver.rcompare(a.replace(reSemVer, '$1'), b.replace(reSemVer, '$1'));
}

/* resolveme Bundle definition */

function Bundle(targets) {
	// call the inherits event emitter constructor
	events.EventEmitter.call(this);

	// save the targets
	this.targets = targets || [];
}

util.inherits(Bundle, events.EventEmitter);

Bundle.prototype._find = function(opts, target, callback) {
	var fileType = (opts.fileType || 'js').replace(reLeadingDot, ''),
		modulePath = path.resolve(opts.cwd, 'modules'),
		modulePaths = [], itemPath;

	// add a module search path for a pattern specific path if we have one
	if (opts.pattern) {
		modulePaths.push(path.join(modulePath, opts.pattern, target.name));
		modulePaths.push(path.join(modulePath, opts.pattern));
	}

	// add the module name path to the search
	modulePaths.push(path.join(modulePath, target.name));
	modulePaths.push(modulePath);

	// detect the module path
	async.detect(modulePaths, fs.exists || path.exists, function(basePath) {
		debug('looking for modules in base path: ' + basePath);

		// if we have a version for the item, add that to the fileType
		if (target.version && target.version !== 'latest') {
			fileType = ('.' + target.version + '.' + fileType).replace(reSemVerAny, '$1?$2');
		}
		else {
			fileType = '*.' + fileType;
		}

		// update the itemPath to include the name and filetype
		itemPath = path.join(basePath, target.name + fileType);

		// glob the itempath
		debug('checking if item "' + target.name + '"" exists in local modules: ' + itemPath);
		glob(itemPath, function(err, files) {
			if (err || (! files.length)) return callback(false);

			// sort the files based on a semver comparison
			files = files.sort(versionSort);

			debug(files.length + ' items matching glob expression');
			callback(null, files[0]);
		});
	});

	/*
	// if we have a version for the item, add that to the fileType
	if (target.version && target.version !== 'latest') {
		fileType = ('.' + target.version + fileType).replace(reSemVerAny, '$1?$2');
	}
	else {
		fileType = '*' + fileType;
	}

	// update the itemPath to include the name and filetype
	itemPath = path.join(itemPath, target.name + fileType);

	// glob the itempath
	debug('checking if item "' + target.name + '"" exists in local modules: ' + itemPath);
	glob(itemPath, function(err, files) {
		if (err || (! files.length)) return callback(false);

		// sort the files based on a semver comparison
		files = files.sort(versionSort);

		debug(files.length + ' items matching glob expression');
		callback(files.length > 0, files[0]);
	});
	*/
};

Bundle.prototype._get = function(opts, target, callback) {
	this._find(opts, target, function(err, itemPath) {
		if (err) return callback(err);

		// flag the item as resolved
		target.resolved = true;

		debug('found: ' + itemPath);
		callback();
	});
};

Bundle.prototype.resolve = function(opts, callback) {
	// find the targets that still required resolution	
	var targets = this.targets.filter(function(target) {
		return !target.resolved;
	});

	if (typeof opts == 'function') {
		callback = opts;
		opts = {};
	}

	// if we have no targets, then trigger the callback and exit
	if (targets.length === 0) return this.emit('complete');

	// get the sources for each of the specified targets
	async.forEach(
		targets, 
		this._get.bind(this, opts), 
		this.resolve.bind(this, opts, callback)
	);
};

/* main */

function resolveme(targets, opts, callback) {
	var bundle = new Bundle(parseTargets(targets));

	// resolve the bundle
	bundle.resolve(opts);
	bundle.on('complete', callback);

	// return the scope which passes on useful events
	return bundle;
}

module.exports = resolveme;