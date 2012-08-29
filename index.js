var async = require('async'),
	findme = require('findme'),
	glob = require('glob'),
	events = require('events'),
	debug = require('debug')('resolveme'),
	localResolver = require('./resolvers/local'),
	util = require('util'),
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

	// iterate through the targets provided to the constructor and add them
	(targets || []).forEach(this.add.bind(this));
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

Bundle.prototype.add = function(target) {
	if (typeof target == 'string' || (target instanceof String)) {
		target = new findme.Requirement(target);
	}

	// add the target to the targets list
	this.targets.push(target);

	return this;
};

Bundle.prototype.resolve = function(opts, callback) {
	// find the targets that still required resolution	
	var bundle = this,
		targets = this.targets.filter(function(target) {
			return target && typeof target._manifest == 'undefined';
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
				if (! resolver) return callback(new Error('unable to resolve: ' + target));

				resolver.retrieve(target, opts, function(err, manifest) {
					console.log(target._manifest = manifest || {});

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

	// return the scope which passes on useful events
	return bundle;
}

module.exports = resolveme;