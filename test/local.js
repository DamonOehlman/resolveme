var assert = require('assert'),
	resolveme = require('..'),
	path = require('path'),
	repositories = {
		'relaxed': path.resolve(__dirname, 'modules-relaxed'),
		'strict': path.resolve(__dirname, 'modules-strict'),
		'mixed': path.resolve(__dirname, 'modules')
	},
	_ = require('underscore');

describe('local resolution tests', function() {

	_.each(repositories, function(value, key) {
		describe(key + ' repsitory tests', function() {
			it('should be able to find a local copy of underscore', function(done) {
				resolveme('underscore', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);

					done();
				});
			});

			it('should be able to find a local copy of registry', function(done) {
				resolveme('registry', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 3);

					// console.log(require('util').inspect(bundle.targets, true, null, true));
					done();
				});
			});
		});
	});

});