creatartis-base.js
==================

Bundle of assorted utility definitions used in our Javascript projects. Can be loaded as a CommonJS module, with AMD, or with a `<script>` tag (defines `base` in the global scope). Tested in NodeJS, Firefox & Chrome using [RequireJS](http://requirejs.org/).

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/) [![NPM](https://nodei.co/npm/creatartis-base.png?mini=true)](https://www.npmjs.com/package/creatartis-base)

Includes (among other things):

* OOP related functions like `declare` (similar to [Dojo's](http://dojotoolkit.org/reference-guide/dojo/_base/declare.html)).
* A [promises](http://en.wikipedia.org/wiki/Futures_and_promises) implementation for dealing with asynchronism, called `Future` (like Java's).
* Functional style iterators and iterables.
* Pseudorandom number generators (Javascript's `Math.random` does not allow seeding) with a rich set of features.
* A `Chronometer`, and objects for gathering `Statistics`.

It's still work in progress and not completely tested, and it will probably remain so for a long time (or ever).  

## License

Open source under an [MIT license](LICENSE.md) (see LICENSE.md).

## Contact

Suggestions and comments are always welcome at [leonardo.val@creatartis.com](mailto:leonardo.val@creatartis.com).