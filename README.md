# resolveme

The `resolveme` module makes it much simpler to incorporate web resources into your project through the use of a centralized repository of libraries. 


## Understanding Repository Structure

There are two types of repository structure that resolveme can work with, either:

- a strict repository structure where modules are stored in versioned directories; or,
- a loose repository structure where modules are stored as simple file references

Additionally, a mixture of the two structures can be used, however, it should be noted that if a strict structure is detected for a particular module, and a loose equivalent of the module will always be ignored.

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

### Example 2: Loose Structure

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