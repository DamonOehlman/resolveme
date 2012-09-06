var assert = require('assert'),
	resolveme = require('..'),
	parts = {
		js: ['var a = 5', 'var b = 2'],
		css: ['body { font-family: Arial; }', 'header { font-weight: bold; }']
	},
	output = {
		js: 'var a = 5\n;var b = 2',
		css: 'body { font-family: Arial; }\nheader { font-weight: bold; }'
	};

describe('join tests for file types', function() {
	it('should be able to join sections in a js appropriate way (js extension)', function() {
		assert.equal(resolveme.join(parts.js, 'js'), output.js);
	});

	it('should be able to join sections in a js appropriate way (.js extension)', function() {
		assert.equal(resolveme.join(parts.js, '.js'), output.js);
	});

	it('should be able to join sections in a css appropriate way (css extension)', function() {
		assert.equal(resolveme.join(parts.css, 'css'), output.css);
	});

	it('should be able to join sections in a css appropriate way (.css extension)', function() {
		assert.equal(resolveme.join(parts.css, '.css'), output.css);
	});
});