var assert = require('assert'),
	resolveme = require('..');

describe('adding requirements checks', function() {
	it('should be able to add a single requirement to a bundle', function() {
		var bundle = resolveme();

		bundle.add('underscore');

		assert.equal(bundle.targets.length, 1);
		assert.equal(bundle.targets[0].name, 'underscore');
	});

	it('should be able to add a single versioned requirement to a bundle', function() {
		var bundle = resolveme();

		bundle.add('underscore 1.3.x');

		assert.equal(bundle.targets.length, 1);
		assert.equal(bundle.targets[0].name, 'underscore');		
		assert.equal(bundle.targets[0].version, '1.3.x');
	});

	it('should only allow a named requirement to be added once', function() {
		var bundle = resolveme();

		bundle.add('underscore');
		bundle.add('underscore');

		assert.equal(bundle.targets.length, 1);
		assert.equal(bundle.targets[0].name, 'underscore');
	});
});