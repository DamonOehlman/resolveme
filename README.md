# resolveme

This is a utility library for helping resolve [findme](https://github.com/DamonOehlman/findme) module requirements back to a valid source.  This package is designed to assist with resolving clientside module dependencies effectively.

The core `resolveme` module is designed to resolve dependencies against the local filesystem, but has been designed to allow remote resolvers to also work.

A valid source can be any of the following:

- A local folder stored in a versioned `modules` directory in the current working directory (which can be overriden with resolveme opts).  For example, a local copy of the underscore library would be located in the `modules/underscore/1.3.3/` directory.

- A valid (i.e. appropriately tagged) github repository that contains valid web files (e.g. `js`, `css`, `html`) files.

- A [volo](https://github.com/volojs/volo) override as specified in [volojs/repos](https://github.com/volojs/repos)

- A [bake.io](http://github.com/bake-io) recipe as defined in the [cookbook](https://github.com/bake-io/cookbook)

The search for the local folder is completed first, and once this has been completed, the other potential sources are queried in parallel for optimal execution time.

## Example Usage

```js
resolveme(['underscore 1.3.x'], function(err, bundle) {

});
```

If you wish resolveme to ignore any local modules then you can specify the `ignoreLocal` option to reject skip local modules.

```js
resolveme(['underscore 1.3.x'], { ignoreLocal: true }, function(err, bundle) {
	
});
```