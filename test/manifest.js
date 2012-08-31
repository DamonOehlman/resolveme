var assert = require('assert'),
	findme = require('findme'),
	resolveme = require('..'),
	Manifest = require('../manifest').Manifest;

function defineDummyUnderscore(force) {
	var m = new Manifest('underscore', '/tmp/modules');

	m.add('function _() {}', '/tmp/modules/underscore.1.3.3.js', force);
	m.add('var _s = {};', '/tmp/modules/underscore-string.js', force);

	return m;
}

describe('manifest creation tests', function() {
	it('should be able to create an empty manifest', function() {
		assert(new Manifest());
	});

	it('should be able to create an empty, named manifest', function() {
		var m = new Manifest('underscore');

		assert(m);
		assert.equal(m.name, 'underscore');
	});

	it('should strip invalid name characters from a manifest name', function() {
		var m = new Manifest('spin.js');

		assert(m);
		assert.equal(m.name, 'spin');
	});

	it('should be able to add content to a manifest', function() {
		var m = new Manifest('underscore'),
			data = m.add('function _() {}', 'underscore.js');

		assert(m);
		assert(data);
		assert.equal(m.items.length, 1);
		assert.equal(data.name, 'underscore');
		assert.equal(data.fileType, 'js');
		assert.equal(data.content, 'function _() {}');
		assert.equal(m.getContent(), 'function _() {}');
	});

	it('should be able to add content to a manifest with a basepath', function() {
		var m = new Manifest('underscore', '/tmp/modules'),
			data = m.add('function _() {}', '/tmp/modules/underscore.js');

		assert(m);
		assert(data);
		assert.equal(m.items.length, 1);
		assert.equal(data.name, 'underscore');
		assert.equal(data.fileType, 'js');
		assert.equal(data.content, 'function _() {}');

		// check the manifest content
		assert.equal(m.getContent(), 'function _() {}');
	});

	it('should be able to handle versioned library names', function() {
		var m = new Manifest('underscore', '/tmp/modules'),
			data = m.add('function _() {}', '/tmp/modules/underscore.1.3.3.js');

		assert(m);
		assert(data);
		assert.equal(m.items.length, 1);
		assert.equal(data.name, 'underscore');
		assert.equal(data.fileType, 'js');
		assert.equal(data.content, 'function _() {}');

		// check the manifest content
		assert.equal(m.getContent(), 'function _() {}');
	});

	it('should order parts with a name match before others', function() {
		var m = defineDummyUnderscore(true);

		assert.equal(m.items.length, 2);
		assert.equal(m.items[0].name, 'underscore');

		// check the manifest content
		assert.equal(m.getContent('js'), 'function _() {}\n;var _s = {};');
	});

	it('should be able to retrieve using an uppercase filetype', function() {
		var m = defineDummyUnderscore(true);

		// check the manifest content
		assert.equal(m.getContent('JS'), 'function _() {}\n;var _s = {};');
	});

	it('should be able to retrieve using an filetype with a leading dot', function() {
		var m = defineDummyUnderscore(true);

		// check the manifest content
		assert.equal(m.getContent('.js'), 'function _() {}\n;var _s = {};');
	});

	it('should validate that the paths member of the manifest equals the number of items added', function() {
		var m = defineDummyUnderscore(true);

		assert.equal(m.paths.length, 2);
	});

	it('should be able to get a specific resource from the manifest', function() {
		var m = defineDummyUnderscore(true);

		// check that we can get underscore out
		assert(m.get('underscore.js'));
		assert(m.get('underscore-string.js'));
	});

	it('should correctly reject non-matching modules when a manifest has findme module information', function() {
		var m = defineDummyUnderscore();

		// check that we have an underscore.js file
		assert(m.get('underscore.js'));

		// ensure that the underscore-string.js file has been rejected
		assert(! m.get('underscore-string.js'), 'underscore-string.js module was included, but should have been rejected');
	});

	it('should include a single extra modules when requested', function() {
		var m = new Manifest(findme.define('mapcontrols[zoom]'), '/tmp/modules/mapcontrols.0.2.0');

		m.add('function mapcontrols() {}', '/tmp/modules/mapcontrols.0.2.0/mapcontrols.js');
		m.add('mapcontrols.zoom = {};', '/tmp/modules/mapcontrols.0.2.0/controls/zoom.js');
		m.add('mapcontrols.scale = {};', '/tmp/modules/mapcontrols.0.2.0/controls/scale.js');

		// check that mapcontrols was added
		assert(m.get('mapcontrols.js'));

		// check that the zoom control got added too
		assert(m.get('controls/zoom.js'), 'zoom control was not added even though it was specified');

		// check that the scale control was rejected as it wasn't specified
		assert(! m.get('controls/scale.js'), 'scale control was not rejected');
	});

	it('should include multiple extra modules when requested', function() {
		var m = new Manifest(findme.define('mapcontrols[zoom:scale]'), '/tmp/modules/mapcontrols.0.2.0');

		m.add('function mapcontrols() {}', '/tmp/modules/mapcontrols.0.2.0/mapcontrols.js');
		m.add('mapcontrols.zoom = {};', '/tmp/modules/mapcontrols.0.2.0/controls/zoom.js');
		m.add('mapcontrols.scale = {};', '/tmp/modules/mapcontrols.0.2.0/controls/scale.js');

		// check that mapcontrols was added
		assert(m.get('mapcontrols.js'));

		// check that the zoom control got added too
		assert(m.get('controls/zoom.js'), 'zoom control was not added even though it was specified');

		// check that the scale control was rejected as it wasn't specified
		assert(m.get('controls/scale.js'), 'scale control was not added even though it was specified');
	});

	it('should include supporting css files when a module is requested', function() {
		var m = new Manifest(findme.define('mapcontrols[zoom]'), '/tmp/modules/mapcontrols.0.2.0');

		m.add('function mapcontrols() {}', '/tmp/modules/mapcontrols.0.2.0/mapcontrols.js');
		m.add('mapcontrols.zoom = {};', '/tmp/modules/mapcontrols.0.2.0/controls/zoom.js');
		m.add('/* */', '/tmp/modules/mapcontrols.0.2.0/controls/zoom.css');

		// check that mapcontrols was added
		assert(m.get('mapcontrols.js'));

		// check that the zoom control got added too
		assert(m.get('controls/zoom.js'), 'zoom control was not added even though it was specified');
		assert(m.get('controls/zoom.css'), 'zoom control css was not found');
	});
});