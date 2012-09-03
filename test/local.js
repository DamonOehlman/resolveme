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
		describe(key + ' repository tests', function() {
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
					assert.equal(bundle.targets[0].manifest.items.length, 3);
					assert.equal(bundle.fileTypes.length, 3);
					done();
				});
			});

			it('should be able to find a local copy of handlebars', function(done) {
				resolveme('handlebars', { repository: value }, function(err, bundle) {
					assert.ifError(err);
					assert.equal(bundle.targets.length, 1);
					assert.equal(bundle.targets[0].name, 'handlebars');

					// console.log(require('util').inspect(bundle.targets, true, null, true));
					done();

				});
			});

			it('should be able to find a local copy of bootstrap', function(done) {
				resolveme('bootstrap', { repository: value }, function(err, bundle) {
					var manifest;

					assert.ifError(err);

					assert.equal(bundle.targets.length, 1);
					assert.equal(bundle.targets[0].name, 'bootstrap');

					// get a copy of the manifest
					manifest = bundle.targets[0].manifest;

					// ensure we have 4 items (1 js, 1 css, 2 images)
					assert.equal(manifest.paths.length, 4);

					// run some checks on the manifest
					assert(manifest.get('bootstrap.js'));
					assert(manifest.get('css/bootstrap.css'));
					assert(manifest.get('img/glyphicons-halflings-white.png'));
					assert(manifest.get('img/glyphicons-halflings.png'));

					// console.log(require('util').inspect(bundle.targets[0].manifest, true, null, true));
					done();

				});
			});

			it('should be able to find a copy of mapcontrols (just core)', function(done) {
				resolveme('mapcontrols', { repository: value }, function(err, bundle) {
					var manifest;

					assert.ifError(err);

					assert.equal(bundle.targets.length, 4);
					assert.equal(bundle.targets[0].name, 'mapcontrols');

					// get a copy of the manifest
					manifest = bundle.targets[0].manifest;

					// ensure we have mapcontrols.js 
					assert(manifest.get('mapcontrols.js'));

					// ensure that the zoom control was rejected
					assert(! manifest.get('controls/zoom.js'), 'zoom control included when it should have been ignored')

					done();

				});
			});

			it('should be able to find a copy of mapcontrols (with zoom)', function(done) {
				resolveme('mapcontrols[zoom]', { repository: value }, function(err, bundle) {
					var manifest;

					assert.ifError(err);

					assert.equal(bundle.targets.length, 4);
					assert.equal(bundle.targets[0].name, 'mapcontrols');

					// get a copy of the manifest
					manifest = bundle.targets[0].manifest;

					// ensure we have mapcontrols.js 
					assert(manifest.get('mapcontrols.js'));

					// ensure that the zoom control was rejected
					assert(manifest.get('controls/zoom.js'), 'zoom control was not included');
					assert(manifest.get('controls/zoom.css'), 'zoom control css was not included');

					// ensure that the scale control was rejected
					assert(! manifest.get('controls/scale.js'), 'scale control included when it should have been ignored');

					done();

				});
			});

			it('should be able to find a copy of mapcontrols (with zoom and scale)', function(done) {
				resolveme('mapcontrols[zoom:scale]', { repository: value }, function(err, bundle) {
					var manifest;

					assert.ifError(err);

					assert.equal(bundle.targets.length, 4);
					assert.equal(bundle.targets[0].name, 'mapcontrols');

					// get a copy of the manifest
					manifest = bundle.targets[0].manifest;

					// ensure we have mapcontrols.js 
					assert(manifest.get('mapcontrols.js'));

					// ensure that extra controls were included
					assert(manifest.get('controls/zoom.js'), 'zoom control was not included');
					assert(manifest.get('controls/zoom.css'), 'zoom control css was not included');
					assert(manifest.get('controls/scale.js'), 'scale control was not included');
					assert(manifest.get('controls/scale.css'), 'scale control css was not included');

					// ensure that the zoomrect control was rejected
					assert(! manifest.get('controls/zoomrect.js'), 'zoomrect control included when it should have been ignored');

					done();
				});
			});

			it('should be able to find a copy of spin.js', function(done) {
				resolveme('spin.js', { repository: value }, function(err, bundle) {
					var manifest;

					assert.ifError(err);

					assert.equal(bundle.targets.length, 1);
					assert.equal(bundle.targets[0].name, 'spin.js');
					assert(bundle.targets[0].manifest, 'No manifest found');

					// ensure that the actual library code was loaded
					assert(bundle.targets[0].manifest.get('spin.js'), 'spin.js library code was not loaded');

					done();
				});

			});
		});
	});

});