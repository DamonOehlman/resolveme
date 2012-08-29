var assert = require('assert'),
	path = require('path'),
	resolveme = require('..');

describe('repository checks', function() {
	it('should raise an error for an invalid repository', function(done) {
		resolveme('underscore', { repository: path.resolve(__dirname, 'blah') }, function(err, bundle) {
			assert(err, 'Invalid repository was not caught');
			done();
		});
	});
});