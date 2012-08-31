// for stripping leading dots
exports.leadingDot = /^\./;

// semver regex
exports.semver = /((?:\d+|x)\.(?:\d+|x)\.(?:\d+|x))(-[0-9]+-?)?([a-zA-Z-][a-zA-Z0-9-\.:]*)?/;

// semver replace with 
exports.semverAny = /(?:(\.)x(\.?)|(\.?)x(\.))/;

// ignore files
exports.fileIgnore = /(\.ds_store$)/i;

// define some invalid name parts
exports.invalidNameParts = /\.js$/i;

// define a regular expression that is capable of extracting the relevant parts of a file / folder
// that has been (optionally) named with a semantic version
exports.nameParts = /^(.*[\/\\])?([\w\-]+)(\.\d+\.\d+\.\d+)?\.?(.*)$/;
