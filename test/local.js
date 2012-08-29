var assert = require('assert'),
	resolveme = require('..');

describe('local resolution tests', function() {
	it('should be able to find a local copy of underscore', function(done) {
		resolveme('underscore', { cwd: __dirname }, function(err, bundle) {
			assert.ifError(err);

			console.log(bundle);
			done();
		});
	});
});