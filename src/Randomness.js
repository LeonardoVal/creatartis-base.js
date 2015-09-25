/** # Randomness

Randomness is the base class for pseudorandom number generation algorithms and related functions. A 
limitation with Javascript's `Math.random` function is that it cannot be seeded. This hinders its 
use for simulations and simular purposes.
*/
var Randomness = exports.Randomness = declare({
	/** The `Randomness` instances are build with a `generator` function. This is a function that is 
	called without any parameters and returns a random number between 0 (inclusive) and 1 
	(exclusive). If none is given the standard `Math.random´ is used.
	*/
	constructor: function Randomness(generator) {
		if (typeof generator === 'function') {
			this.__random__ = generator;
		}
	},

	__random__: Math.random,
	
	/** The basic use of the pseudorandom number generator is through the method `random`. Called 
	without arguments returns a random number in [0,1). Called with only the first argument x, 
	returns a random number in [0, x). Called with two arguments (x, y) return a random number in 
	[x,y).
	*/
	random: function random() {
		var n = this.__random__();
		switch (arguments.length) {
			case 0: return n;
			case 1: return n * arguments[0];
			default: return (1 - n) * arguments[0] + n * arguments[1];
		}
	},

	/** The method `randomInt` behaves the same way `random` does, but returns an integer instead.
	*/
	randomInt: function randomInt() {
		return Math.floor(this.random.apply(this, arguments));
	},

	/** The method `randomBool` tests against a probability (50% by default), yielding true with the 
	given chance, or else false.
	*/
	randomBool: function randomBool(prob) {
		return this.random() < (isNaN(prob) ? 0.5 : +prob);
	},

	// ## Sequence handling ########################################################################

	/** A shortcut for building an array of n random numbers calling is `randoms`. Numbers are 
	generated calling `random` many times.
	*/
	randoms: function randoms(n) {
		var args = Array.prototype.slice.call(arguments, 1),
			result = [], i;
		n = +n;
		for (i = 0; i < n; i++) {
			result.push(this.random.apply(this, args));
		}
		return result;
	},

	/** To randomnly selects an element from a sequence `xs` use `choice(xs)`. If more than one 
	argument is given, the element is chosen from the argument list.
	*/
	choice: function choice(from) {
		from = arguments.length > 1 ? Array.prototype.slice.call(arguments) : 
			Array.isArray(from) ? from : 
			iterable(from).toArray();
		return from.length < 1 ? undefined : from[this.randomInt(from.length)];
	},

	/** To randomnly selects `n` elements from a sequence `xs` use `choices(n, xs)`. If more than 
	two arguments are given, the elements are taken from the second arguments on.
	*/
	choices: function choices(n, from) {
		return this.split.apply(this, arguments)[0];
	},
	
	/** To take `n` elements from a sequence `xs` randomnly use `split(n, xs)`. It returns an array 
	`[A, B]` with `A` being the taken elements and `B` the remaining ones. If more than two 
	arguments are given, elements are taken from the second argument on.
	*/
	split: function split(n, from) {
		from = arguments.length > 2 ? Array.prototype.slice.call(arguments) : iterable(from).toArray();
		var r = [];
		for (n = Math.min(from.length, Math.max(+n, 0)); n > 0; n--) {
			r = r.concat(from.splice(this.randomInt(from.length), 1));
		}
		return [r, from];
	},

	/** The method `shuffle(xs)` randomnly rearranges elements in xs; returning a copy.
	*/
	shuffle: function shuffle(elems) { //TODO This can be optimized by making random swaps.
		return this.choices(elems.length, elems);
	},

	// ## Weighted choices #########################################################################
	
	/** Given a sequence of `weightedValues` (pairs `[value, weight]`), a normalization scales all 
	weights proportionally, so they add up to 1 and hence can be treated as probabilities. If any
	weight is negative, an error is raised.
	*/
	normalizeWeights: function normalizeWeights(weightedValues) {
		weightedValues = iterable(weightedValues);
		var sum = 0, min = Infinity, length = 0;
		weightedValues.forEachApply(function (value, weight) {
			raiseIf(weight < 0, "Cannot normalize with negative weights!");
			sum += weight;
			if (weight < min) {
				min = weight;
			}
			length++;
		});
		sum -= min * length;
		return weightedValues.mapApply(function (value, weight) {
			return [value, (weight - min) / sum];
		});
	},
	
	/** A `weightedChoice` is a choice where each value has its own probability. The given 
	`weightedValues` must be normalized, i.e. the weights must add up to 1.
	*/
	weightedChoice: function weightedChoice(weightedValues) {
		var chance = this.random(), result;
		iterable(weightedValues).forEachApply(function (value, weight) {
			chance -= weight;
			if (chance <= 0) {
				result = value;
				Iterable.stop();
			}
		});
		return result;
	},
	
	/** The method `weightedChoices` performs `n` weighted choices, without repeating values.
	*/
	weightedChoices: function weightedChoices(n, weightedValues) {
		weightedValues = iterable(weightedValues).toArray();
		var maxProb = 1, results = [], random;
		for (var i = 0; i < n; ++i) {
			random = this.random(maxProb);
			iterable(weightedValues).forEachApply(function (value, weight, i) {
				random -= weight;
				if (random <= 0) {
					results.push(value);
					maxProb -= weight;
					weightedValues.splice(i, 1); // Remove selected element.
					Iterable.stop();
				}
			});
		}
		return results;
	},

	// ## Distributions ############################################################################

	/** An `averagedDistribution(times)` of a `Randomness` instance is another `Randomness` instance 
	based on this one, but generating numbers by averaging its random values a given number of 
	`times` (2 by default). The result is an aproximation of the normal distribution as times
	increases.
	*/
	averagedDistribution: function averagedDistribution(n) {
		n = Math.max(+n, 2);
		var randomFunc = this.__random__;
		return new Randomness(function () { 
			var s = 0.0;
			for (var i = 0; i < n; i++) {
				s += randomFunc();
			}
			return s / n;
		});
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'Randomness',
		serializer: function serialize_Randomness(obj) {
			return obj.__random__ !== Math.random ? [obj.__random__] : [];
		},
		materializer: function materialize_Randomness(obj, args) {
			return args && (args.length < 1 ? Randomness.DEFAULT : new Randomness(args[0]));
		}
	}
}); //- declare Randomness.

// ## Default generator ############################################################################

/** `Randomness.DEFAULT` holds the default static instance, provided for convenience. Uses 
`Math.random()`.
*/
Randomness.DEFAULT = new Randomness();

['random', 'randomInt', 'randomBool', 'choice', 'split', 'choices', 'shuffle',
 'averagedDistribution'
].forEach(function (id) {
	Randomness[id] = Randomness.DEFAULT[id].bind(Randomness.DEFAULT);
});

// ## Algorithms ###################################################################################

// ### Linear congruential #########################################################################

/** `Randomness.LinearCongruential` builds a pseudorandom number generator constructor implemented 
with the [linear congruential algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator).
It also contain the following shortcuts to build common variants:
*/
var LinearCongruential = Randomness.LinearCongruential = declare(Randomness, {
	constructor: function LinearCongruential(m, a, c, seed) {
		var i = isNaN(seed) ? Date.now() : Math.floor(seed);
		this.__arguments__ = [m, a, c, i];
		this.__random__ = function __random__() {
			return (i = (a * i + c) % m) / m;
		};
	},
	
	'static __SERMAT__': {
		identifier: 'LinearCongruential',
		serializer: function serializer_LinearCongruential(obj) {
			return obj.__arguments__;
		}
	},
	
	/** + `numericalRecipies(seed)`: builds a linear congruential pseudorandom number generator as 
		it is specified in [Numerical Recipies](http://www.nr.com/).
	*/
	'static numericalRecipies': function (seed) {
		return new LinearCongruential(0xFFFFFFFF, 1664525, 1013904223, seed);
	},
	
	/** + `borlandC(seed)`: builds a linear congruential pseudorandom number generator as it used by
		Borland C/C++.
	*/
	'static borlandC': function (seed) {
		return new LinearCongruential(0xFFFFFFFF, 22695477, 1, seed);
	},
	
	/** + `glibc(seed)`: builds a linear congruential pseudorandom number generator as it used by
		[glibc](http://www.mscs.dal.ca/~selinger/random/).
	*/
	'static glibc': function (seed) {
		return new LinearCongruential(0xFFFFFFFF, 1103515245, 12345, seed);
	}
});

// ### Mersenne twister ############################################################################

/** The method `Randomness.mersenneTwister` returns a pseudorandom number generator constructor 
implemented with the [Mersenne Twister algorithm](http://en.wikipedia.org/wiki/Mersenne_twister#Pseudocode).
*/
Randomness.MersenneTwister = (function (){
	/** Bit operations in Javascript deal with signed 32 bit integers. This algorithm deals with
	unsigned 32 bit integers. That is why this function is necessary.
	*/
	function unsigned(n) {
		return n < 0 ? n + 0x100000000 : n;
	}
	
	function initialize(seed) {
		var numbers = new Array(624),
			last;
		numbers[0] = last = seed;
		for (var i = 1; i < 624; ++i) {
			numbers[i] = last = (0x6C078965 * unsigned(last ^ (last << 30)) + i) % 0xFFFFFFFF;
		}
		return numbers;
	}
	
	function generate(numbers) {
		for(var i = 0; i < 624; ++i) {
			var y = (numbers[i] & 0x80000000) | (numbers[(i+1) % 624] & 0x7FFFFFFF);
			numbers[i] = unsigned(numbers[(i + 397) % 624] ^ (y * 2));
			if ((y & 1) !== 0) {
				numbers[i] = unsigned(numbers[i] ^ 0x9908B0DF);
			}
		}
	}

	return declare(Randomness, {
		constructor: function MersenneTwister(seed) {
			this.__seed__ = isNaN(seed) ? Date.now() : Math.floor(seed);
			var numbers = initialize(this.__seed__),
				index = 0;
			this.__random__ = function () {
				if (index === 0) {
					generate(numbers);
				}
				var y = numbers[index];
				y = unsigned(y ^ (y << 11));
				y = unsigned(y ^ ((y >>> 7) & 0x9D2C5680));
				y = unsigned(y ^ ((y >>> 15) & 0xEFC60000));
				y = unsigned(y ^ (y << 18));
				index = (index + 1) % 624;
				return y / 0xFFFFFFFF;
			};
		},
		
		'static __SERMAT__': {
			identifier: 'MersenneTwister',
			serializer: function serializer_MersenneTwister(obj) {
				return [obj.__seed__];
			}
		},
	});
})();