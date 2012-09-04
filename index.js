var async = require('async'),
	findme = require('findme'),
	events = require('events'),
	debug = require('debug')('resolveme'),
	localResolver = require('./resolvers/local'),
	getFileSeparator = require('./manifest').getFileSeparator,
	util = require('util'),
	_ = require('underscore'),
	reCommaDelim = /\,\s*/;

/* private helpers */

function parseTargets(targets) {
}

/* resolveme Bundle definition */

function Bundle(targets) {
	// call the inherits event emitter constructor
	events.EventEmitter.call(this);

	// initialise the targets
	this.targets = [];

	// ensure the targets array is valid
	targets = targets || [];

	// add each of the targets
	for (var ii = 0; ii < targets.length; ii++) {
		this.add(targets[ii]);
	}
}

util.inherits(Bundle, events.EventEmitter);

Bundle.prototype._locate = function(target, opts, callback) {
	async.detect(
		opts.resolvers || [localResolver],

		function(resolver, itemCallback) {
			resolver.exists(target, opts, itemCallback);
		},

		callback
	);
};

Bundle.prototype.add = function(target, atStart) {
	// if the target is empty, return this
	if (! target) return this;

	if (typeof target == 'string' || (target instanceof String)) {
		target = findme.define(target.trim());
	}

	// add the target to the targets list
	if (target && target.name) {
		var existing = this.targets.filter(function(item) {
			return item.name.toLowerCase() === target.name.toLowerCase();
		})[0];

		// if we have an existing item with the same name, return
		// TODO: check versions see if we should override, etc
		if (existing) return this;

		// add the target
		Array.prototype[atStart ? 'unshift' : 'push'].call(this.targets, target);
	}

	return this;
};

Bundle.prototype.getContent = function(fileType) {
	var items = this.targets.map(function(target) {
		return target.manifest.getContent(fileType);
	});

	return items.join(getFileSeparator(fileType));
};

Bundle.prototype.resolve = function(opts, callback) {
	// find the targets that still required resolution	
	var bundle = this,
		targets = this.targets.filter(function(target) {
			return target && typeof target.manifest == 'undefined';
		});

	// if we have no targets, then trigger the callback and exit
	if (targets.length === 0) {
		if (callback) callback(null, this);

		return this.emit('complete');
	}

	// get the sources for each of the specified targets
	async.forEach(
		targets,

		function(target, itemCallback) {
			bundle._locate(target, opts, function(resolver) {
				// if we didn't get a resolver report that too
				if (! resolver) return callback(new Error('unable to resolve: ' + target));

				resolver.retrieve(target, opts, function(err, manifest, deps) {
					// update the manifest
					target.manifest = manifest || {};

					// add the dependencies to the target
					target._deps = deps || [];

					// iterate through the dependencies and create new targets
					target._deps.forEach(function(item) {
						bundle.add(item, true);
					});

					// trigger the callback
					itemCallback(err);
				});
			});
		},

		function(err) {
			if (err) return callback(err);

			bundle.resolve(opts, callback);
		}
	);
};

Object.defineProperty(Bundle.prototype, 'fileTypes', {
	get: function() {
		var fileTypes = [];

		this.targets.forEach(function(target) {
			if (target.manifest) {
				fileTypes = fileTypes.concat(target.manifest.fileTypes);
			}
		});

		return _.uniq(fileTypes.sort(), true);
	}
});

/* main */

function resolveme(targets, opts, callback) {
	var bundle;

	// if we have been provied a string of targets, then split on commas
	if (typeof targets == 'string' || (targets instanceof String)) {
		targets = targets.split(reCommaDelim);
	}

	// check for the 2 arg variant of the function
	if (typeof opts == 'function') {
		callback = opts;
		opts = {};
	}

	// create the new bundle
	bundle = new Bundle(targets);

	// resolve the bundle (if we have targets)
	if (bundle.targets.length > 0) {
		bundle.resolve(opts, callback);
	}
	else if (callback) {
		callback(null, bundle);
	}

	// return the scope which passes on useful events
	return bundle;
}

module.exports = resolveme;