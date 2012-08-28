var async = require('async'),
	findme = require('findme'),
	resolver = require('./lib/resolver'),
	reCommaDelim = /\,\s*/;

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

function resolve(target, callback) {

}

function resolveme(targets, opts, callback) {
	if (typeof opts == 'function') {
		callback = opts;
		opts = {};
	}

	async.map(parseTargets(targets), resolver(opts), callback);
}

module.exports = resolveme;