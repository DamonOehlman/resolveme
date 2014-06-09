# resolveme

The `resolveme` module makes it much simpler to incorporate web resources
into your project through the use of a centralized repository of
libraries.


[![NPM](https://nodei.co/npm/resolveme.png)](https://nodei.co/npm/resolveme/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/badges/stability-badges) [![Build Status](https://img.shields.io/travis/DamonOehlman/resolveme.svg?branch=master)](https://travis-ci.org/DamonOehlman/resolveme) 

## Understanding Repository Structure

There are two types of repository structure that resolveme can work with, either:

- a strict repository structure where modules are stored in versioned directories; or,
- a relaxed repository structure where modules are stored as simple file references

Additionally, a mixture of the two structures can be used, however, it should be noted that if a strict structure is detected for a particular module, and a relaxed equivalent of the module will always be ignored.

Let's walk through a couple of structure examples:

### Example 1: Strict Structure

The following is an example of a strict module structure where copies of backbone, underscore and jquery are kept:

```
- modules
|- backbone.0.9.2
|- backbone.0.9.1
|- backbone.0.9.0
|- backbone.0.5.2
|- jquery.1.8.0
|- jquery.1.7.2
|- jquery.1.7.1
|- jquery.1.6.3
|- underscore.1.3.3
|- underscore.1.3.2
|- underscore.1.3.1
|- underscore.1.3.0
|- underscore.1.2.4
```

As each of these libraries is a simple JS library, then each of the folders will only contain a backbone.js, jquery.js or underscore.js depending on the library.

It should also be noted that for single-file libraries, that you can skip including the folder and simply place a [semver] named file in the modules folder also (e.g. `backbone.0.9.2.js`).

### Example 2: Relaxed Structure

If the above structure seems too heavy and convoluted for you, then you can do away with version numbers all together and use a loose directory structure instead:

```
- modules
|- backbone.js
|- underscore.js
|- jquery.js
```

As you can see this is a far simpler structure, but does mean that any version specific [findme] references will resolve to the unversioned file stored in the loose repository.

[semver]: http://semver.org/ "Semantic Versioning"
[findme]: https://github.com/DamonOehlman/findme


## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
