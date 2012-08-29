var assert = require('assert'),
	resolveme = require('..');

describe('local resolution tests', function() {
	it('should be able to find a local copy of underscore', function(done) {
		resolveme('underscore', { cwd: __dirname }, function(err, bundle) {
			assert.ifError(err);

			done();
		});
	});

	it('should be able to find a local copy of registry', function(done) {
		resolveme('registry', { cwd: __dirname }, function(err, bundle) {
			assert.ifError(err);

			// console.log(require('util').inspect(bundle.targets, true, null, true));
			done();
		});
	});
});