var async = require('async'),
	debug = require('debug')('resolveme'),
	fstream = require('fstream'),
	fs = require('fs'),
	glob = require('glob'),
	path = require('path'),
	semver = require('semver'),
	Manifest = require('../manifest'),
	reLeadingDot = /^\./,
	reSemVer = /^.*((?:\d+|x)\.(?:\d+|x)\.(?:\d+|x)).*$/,
	reSemVerAny = /(?:(\.)x(\.?)|(\.?)x(\.))/;

function versionSort(a, b) {
	return semver.rcompare(a.version, b.version);
}

function findItem(target, opts, callback) {
	var fileType = (opts.fileType || 'js').replace(reLeadingDot, ''),
		modulePath = opts.repository || path.resolve(opts.cwd, 'modules'),
		pathIdx = 0, itemPath,
		locations;

	// glob for modules
	glob(path.join(modulePath, target.name + '*'), function(err, files) {
		if (err) return callback(err);

		// extract the locations
		locations = files.map(function(file) {
			var match = reSemVer.exec(file) || [];

			return {
				path: file,
				version: match[1]
			};
		}).sort(versionSort);

		// filter out valid versions
		if (target.version && target.version !== 'latest') {
			locations = locations.filter(function(location) {
				semver.satisfies(location.version, target.version)
			});
		}

		debug('found ' + locations.length + ' potential matching locations');

		// if we have no locations then return an error
		if (locations.length == 0) return callback(new Error('Cannot find target: ' + target));

		debug('location set to: ' + locations[0].path);
		target._location = locations[0].path;
		callback();
	});
}

exports.exists = function(item, opts, callback) {
	findItem(item, opts, function(err) {
		callback((! err) && item._location);
	});
};

exports.retrieve = function(item, opts, callback) {
	var manifest = new Manifest(item.name, item._location),
		reader,
		entries = [];

	// determine whether we are dealing with a single file or directory
	debug('retrieving: ' + item._location);
	fs.stat(item._location, function(err, stats) {
		if (err) return callback(err);

		// if we have a file, then get the location information
		if (stats.isFile()) {
			fs.readFile(item._location, function(err, data) {
				if (! err) {
					manifest.add(data, item._location);
				}

				callback(err, manifest);
			});
		}
		// otherwise, if this is a directory
		else if (stats.isDirectory()) {
			reader = fstream.Reader({ path: item._location });

			reader.on('entry', function(entry) {
				if (entry.type === 'File') {
					entries.push(entry.path);
				}
			});

			// on end read the contents of each of the files
			reader.on('end', function() {
				async.map(entries, fs.readFile, function(err, results) {
					if (err) return callback(err);

					// add each of the buffers to the manifest
					results.forEach(function(data, index) {
						manifest.add(data, entries[index]);
					});

					// pass back the manifest
					callback(err, manifest);
				});
			});

			reader.on('error', callback);
		}
	});
};