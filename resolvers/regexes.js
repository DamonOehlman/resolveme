// for stripping leading dots
exports.leadingDot = /^\./;

// semver regex
exports.semver = /((?:\d+|x)\.(?:\d+|x)\.(?:\d+|x))(-[0-9]+-?)?([a-zA-Z-][a-zA-Z0-9-\.:]*)?/;

// semver replace with 
exports.semverAny = /(?:(\.)x(\.?)|(\.?)x(\.))/;