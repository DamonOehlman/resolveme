# resolveme

This is a utility library for helping resolve [findme](https://github.com/DamonOehlman/findme) module requirements back to a valid source.  

A valid source can be any of the following:

- A valid (i.e. appropriately tagged) github repository that contains valid web files (e.g. `js`, `css`, `html`) files.
- A [volo](https://github.com/volojs/volo) override as specified in [volojs/repos](https://github.com/volojs/repos)
- A [bake.io](http://github.com/bake-io) recipe as defined in the [cookbook](https://github.com/bake-io/cookbook)


As `findme` as a package manager agnostic requirement definition, it will search against a number of various package managers asynchronously to determine the best match.

## Example Usage

```js
resolveme(['underscore 1.3.x'], function(err, bundle) {
	
});
```

or specifying options to adjust default behaviour:

```js
resolveme(['underscore 1.3.x'], { })

## Understanding Resolution Order

