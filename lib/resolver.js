var async = require('async'),
	debug = require('debug')('resolveme'),
	REMOTE_SEARCHERS = []; // , 'github', 'volorepos'];

module.exports = function(opts) {
	var remoteSearchers,
		localSearcher = require('./searchers/local');

	// ensure we have options
	opts = opts || {};

	// set the default resolution targets
	remoteSearchers = (opts.searchers || REMOTE_SEARCHERS).map(function(name) {
		return require('./searchers/' + name);
	});

	return function(item, callback) {
		debug('resolving item: ' + item);

		function exists(searcher, existsCallback) {
			searcher.exists(item, opts, existsCallback);
		}

		// check the local searcher first
		localSearcher.exists(item, opts, function(exists) {
			if (exists) return localSearcher.download(item, opts, callback);
			debug('item "' + item + '" not found locally, using remote searchers');


			// if not check the remote searchers
			async.detect(remoteSearchers, exists, function(searcher) {
				if (! searcher) return callback(new Error('Unable to find item: ' + item));

				searcher.download(item, opts, callback);
			});
		});

	};
}