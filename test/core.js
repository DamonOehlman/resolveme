var assert = require('assert'),
	resolveme = require('..');

describe('core tests', function() {
	it('should fire the callback with an empty bundle with no requirements (null value)', function(done) {
		resolveme(null, function(err, bundle) {
			assert.ifError(err);
			done();
		});
	});

	it('should fire the callback with an empty bundle with no requirements (empty string)', function(done) {
		resolveme('', function(err, bundle) {
			assert.ifError(err);
			done();
		});
	});

	it('should fire the callback with an empty bundle with no requirements (empty array)', function(done) {
		resolveme([], function(err, bundle) {
			assert.ifError(err);
			done();
		});
	});
});