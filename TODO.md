# Pending for [creatartis-base](https://github.com/LeonardoVal/creatartis-base).

## `src/iterables.js`

+ `Iterable.zipWith(f, seq...)` to combine zip with map.
+ `Iterable.slice(from, to, step)` like the Python operator `[::]`.
+ `Iterable.tails()` makes an iterable of all possible suffixes of the sequence.
+ `Iterable.inits()` makes an iterable of all possible prefixes of the sequence.
+ `Iterable.partition(condition)` returns an array with two iterables: the first one with the values that comply with the condition, and the second one with the values that do not.
+ Make iterables compatible with [ES6 iterators and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).
+ [`Iterable.span(pred)`](http://hackage.haskell.org/package/base-4.7.0.2/docs/Data-List.html#g:11).

## `src/text.js`

+ Formatting for numbers (like [`java.text.NumberFormat`](http://docs.oracle.com/javase/7/docs/api/java/text/NumberFormat.html)).

## `src/Randomness.js`

+ Methods `weightedChoice` and `weightedChoices` may have an extra argument to signal that the probabilities are not normalized, and act accordingly.
+ [`Randomness.triangular_distribution`](http://en.wikipedia.org/wiki/Triangular_distribution#Generating_Triangular-distributed_random_variates>).
+ [`Randomness.normal_distribution`](http://en.wikipedia.org/wiki/Normal_distribution#Generating_values_from_normal_distribution).
+ [Linear feedback shift register](http://www.xilinx.com/support/documentation/application_notes/xapp052.pdf).