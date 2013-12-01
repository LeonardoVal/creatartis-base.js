# basis

Bundle of assorted utility definitions used in [Creatartis'](http://creatartis.com/) Javascript projects. Can be loaded as a CommonJS module, with AMD, or directly (defines `basis` in the global scope). Tested in NodeJS, Firefox & Chrome using [RequireJS](http://requirejs.org/).
Includes:
* OOP related functions like `declare` (similar to Dojo's).
* A [promises](http://en.wikipedia.org/wiki/Futures_and_promises) implementation for dealing with asynchronism, called `Future`.
* Functional style iterators and `Iterables`.
* Pseudorandom number generators (Javascript's `Math.random` does not allow seeding) with a rich set of features.
* A `Chronometer`, and objects for gathering `Statistics`.
* A simple `Logger` and a unit testing microlibrary (called `Verifier`).
Open source under an [MIT license](LICENSE.md) (see LICENSE.md).