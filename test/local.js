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

			it('should be able to find a local copy of jquery', function(done) {
				resolveme('jquery', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);
					assert.equal(bundle.targets[0].name, 'jquery');

					// console.log(require('util').inspect(bundle.targets, true, null, true));
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

			it('should be able to find a local copy of backbone', function(done) {
				resolveme('backbone', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 3);

					// assert the bundle has content
					assert(bundle.getContent());

					done();
				});
			});

			it('should be able to find a local copy of leaflet', function(done) {
				resolveme('leaflet', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);

					// assert the bundle has content
					assert(bundle.getContent());

					// validate that we have all three parts of leaflet present
					// NOTE: the relaxed repository form will automatically resolve the 
					// primary .js file and ignore supporting files.  This might be 
					// something that will be resolved in the future but for the moment
					// I consider this acceptable functionality.
					assert.equal(bundle.targets[0].manifest.items.length, key == 'relaxed' ? 1 : 3);
					assert.equal(bundle.fileTypes.length, key == 'relaxed' ? 1 : 3);
					done();
				});
			});
		});
	});

});