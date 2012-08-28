var debug = require('debug')('resolveme'),
	semver = require('semver'),
	fs = require('fs'),
	path = require('path'),
	glob = require('glob'),
	_exists = fs.exists || path.exists,
	reSemVer = /^.*((?:\d+|x)\.(?:\d+|x)\.(?:\d+|x)).*$/,
	reSemVerAny = /(?:(\.)x(\.?)|(\.?)x(\.))/;

function versionSort(a, b) {
	return semver.rcompare(a.replace(reSemVer, '$1'), b.replace(reSemVer, '$1'));
};

exports.exists = function(target, opts, callback) {
	var itemPath = path.resolve(opts.cwd, 'modules'),
		fileType = opts.fileType || '.js',
		versions = [];

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
};

exports.findDeps = function(target, itemPath, opts, callback) {
	// look for a file at the specified location
	console.log(itemPath);

	callback();
};

exports.get = function(itemPath, opts, callback) {
	debug('retrieving item "' + itemPath + '" from the local filesystem');
	fs.readFile(itemPath, 'utf8', callback);
};