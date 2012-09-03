var async = require('async'),
	debug = require('debug')('resolveme'),
	fstream = require('fstream'),
	fs = require('fs'),
	path = require('path'),
	semver = require('semver'),
	Manifest = require('../manifest').Manifest,
	defaultDeps = require('../dependencies'),
	regexes = require('./regexes'),
	_exists = fs.exists || path.exists;

function versionSort(a, b) {
	return semver.rcompare(a.version, b.version);
}

function ignoreInvalidFiles(entry) {
	return ! regexes.fileIgnore.test(entry.path);
}

function findItem(target, opts, callback) {
	var fileType = (opts.fileType || 'js').replace(regexes.leadingDot, ''),
		pathIdx = 0, itemPath,
		locations = [],
		modulePath = opts.repository || path.resolve(opts.cwd, 'modules'),
		reItemMatch = new RegExp('^' + 
			target.name.replace(regexes.invalidNameParts, '') +
			'(\.' + regexes.semver.source + ')?'),
		reItemMatches = {
			'Directory': new RegExp(reItemMatch.source + '$', 'i'),
			'File': new RegExp(reItemMatch.source + '\\.' + fileType + '$', 'i')
		},
		reader;

	debug('looking for "' + target + '" in module path: ' + modulePath);
	_exists(modulePath, function(exists) {
		// if the module path does not exists, then exit
		if (! exists) return callback(new Error('Invalid module path: ' + modulePath));

		reader = fstream.Reader({
			path: modulePath,
			filter: function(entry) {
				return entry.depth === 0 || 
					(entry.depth <= 1 && reItemMatches[entry.type].test(entry.basename));
			}
		});

		reader.on('entry', function(entry) {
			locations.push(entry.path);
		});

		reader.on('error', callback);
		reader.on('end', function() {
			// extract the locations
			locations = locations.map(function(file) {
				var match = regexes.semver.exec(file) || [];

				return {
					path: file,
					version: match[1]
				};
			}).sort(versionSort);

			// filter out valid versions
			if (target.version && target.version !== 'latest') {
				locations = locations.filter(function(location) {
					return semver.satisfies(location.version, target.version)
				});

				// if we found no matching versions for a required version, then 
				// return a custom error message
				if (locations.length == 0) {
					debug('No valid version found for: ' + target);
				}
			}

			debug('found ' + locations.length + ' potential matching locations');

			// if we have no locations then return an error
			if (locations.length == 0) return callback(new Error('Cannot find target: ' + target));

			debug('location set to: ' + locations[0].path);
			target._location = locations[0].path;
			callback();
		});
	});
}

exports.exists = function(item, opts, callback) {
	findItem(item, opts, function(err) {
		callback((! err) && item._location);
	});
};

exports.retrieve = function(item, opts, callback) {
	var manifest, data, reader, dependencies,
		entries = [];

	// initialize the default dependencies
	if (defaultDeps[item.name + '.' + item.version]) {
		dependencies = defaultDeps[item.name + '.' + item.version];
	}
	else {
		dependencies = defaultDeps[item.name] || [];
	}

	// determine whether we are dealing with a single file or directory
	debug('retrieving: ' + item._location);
	fs.stat(item._location, function(err, stats) {
		if (err) return callback(err);

		// if we have a file, then get the location information
		if (stats.isFile()) {
			// create the manifest
			manifest = new Manifest(item, path.dirname(item._location));

			debug('reading file: ' + item._location);
			fs.readFile(item._location, function(err, data) {
				if (! err) {
					data = manifest.add(data, item._location);

					// push the additional dependencies
					if (data) {
						dependencies = dependencies.concat(data.dependencies);
					}
				}

				callback(err, manifest, dependencies);
			});
		}
		// otherwise, if this is a directory
		else if (stats.isDirectory()) {
			// create the manifest
			manifest = new Manifest(item, item._location);

			// create the reader to read files from the target location
			reader = fstream.Reader({ path: item._location, filter: ignoreInvalidFiles });

			reader.on('child', function(entry) {
				if (entry.type === 'File') {
					// TODO: only push parts that are relevant
					// any images
					// css/js with name matching either the main file or matching module
					debug('found entry: ' + entry.path);
					entries.push(entry.path);
				}
			});

			// on end read the contents of each of the files
			reader.on('end', function() {
				async.map(entries, fs.readFile, function(err, results) {
					if (err) return callback(err);

					// add each of the buffers to the manifest
					results.forEach(function(data, index) {
						data = manifest.add(data, entries[index]);

						// push the additional (discovered) dependencies
						if (data) {
							dependencies = dependencies.concat(data.dependencies);
						}
					});

					// pass back the manifest
					callback(err, manifest, dependencies);
				});
			});

			reader.on('error', callback);
		}
	});
};