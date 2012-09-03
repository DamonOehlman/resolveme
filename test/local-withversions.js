var assert = require('assert'),
	resolveme = require('..'),
	path = require('path'),
	repositories = {
		'strict': path.resolve(__dirname, 'modules-strict')
	},
	_ = require('underscore');

describe('local resolution tests (with specific version requirements)', function() {

	_.each(repositories, function(value, key) {
		describe(key + ' repository tests', function() {
			it('should be able to find a local copy of underscore 1.3.x', function(done) {
				resolveme('underscore 1.3.x', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);

					done();
				});
			});

			it('should be able to find a local copy of underscore 1.3.2', function(done) {
				resolveme('underscore 1.3.2', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);

					done();
				});
			});

			it('should be able to find a local copy of underscore 1.3.3', function(done) {
				resolveme('underscore 1.3.3', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);

					done();
				});
			});

			it('should *NOT* be able to find a local copy of underscore 1.3.1', function(done) {
				resolveme('underscore 1.3.1', { repository: value }, function(err, bundle) {
					assert(err, 'Resolved underscore 1.3.1 when it was not in the repository');

					done();
				});
			});

			it('should be able to find a local copy of backbone 0.9.x', function(done) {
				resolveme('backbone 0.9.x', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 3);

					// assert the bundle has content
					assert(bundle.getContent());

					done();
				});
			});

			it('should be able to find a local copy of backbone 0.9.2', function(done) {
				resolveme('backbone 0.9.2', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 3);

					// assert the bundle has content
					assert(bundle.getContent());

					done();
				});
			});
		});
	});

});