var assert = require('assert'),
	resolveme = require('..'),
	Manifest = require('../manifest');

function defineDummyUnderscore() {
	var m = new Manifest('underscore', '/tmp/modules');

	m.add('function _() {}', '/tmp/modules/underscore.1.3.3.js');
	m.add('var _s = {};', '/tmp/modules/underscore-string.js');

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

	it('should be able to add content to a manifest', function() {
		var m = new Manifest('underscore'),
			data = m.add('function _() {}', 'underscore.js');

		assert(m);
		assert(data);
		assert.equal(m.items.length, 1);
		assert.equal(data.name, 'underscore');
		assert.equal(data.fileType, 'js');
		assert.equal(data.content, 'function _() {}');
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
		var m = defineDummyUnderscore();

		assert.equal(m.items.length, 2);
		assert.equal(m.items[0].name, 'underscore');

		// check the manifest content
		assert.equal(m.getContent('js'), 'function _() {}\n;var _s = {};');
	});

	it('should be able to retrieve using an uppercase filetype', function() {
		var m = defineDummyUnderscore();

		// check the manifest content
		assert.equal(m.getContent('JS'), 'function _() {}\n;var _s = {};');
	});

	it('should be able to retrieve using an filetype with a leading dot', function() {
		var m = defineDummyUnderscore();

		// check the manifest content
		assert.equal(m.getContent('.js'), 'function _() {}\n;var _s = {};');
	});
});