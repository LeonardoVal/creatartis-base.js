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
		this.__random__ = generator || Math.random;
	},

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

	/** The method `weightedChoices` chooses `n` values from weighted values randomly, such that 
	each value's probability of being selected is proportional to its weight. The `weightedValues` 
	must be an iterable of pairs [weight, value]. Weights are normalized, but if there are negative 
	weights, the minimum value has probability zero.
	*/
	weightedChoices: function weightedChoices(n, weightedValues) {
		var sum = 0.0, min = Infinity, length = 0, 
			result = [], r;
		iterable(weightedValues).forEach(function (weightedValue) {
			var weight = weightedValue[0];
			sum += weight;
			if (weight < min) {
				min = weight;
			}
			length++;
		});
		//- Normalize weights.
		sum -= min * length;
		weightedValues = iterable(weightedValues).map(function (weightedValue) {
			return [(weightedValue[0] - min) / sum, weightedValue[1]]
		}).toArray();
		//- Make selection.
		for (var i = 0; i < n && weightedValues.length > 0; i++) {
			r = this.random();
			for (var j = 0; j < weightedValues.length; j++) {
				r -= weightedValues[j][0];
				if (r <= 0) {
					result.push(weightedValues[j][1]);
					weightedValues.splice(j, 1); // Remove selected element.
					break;
				}
			}
			//- Fallback when no element has been selected. Unprobable, but may 
			//- happen due to rounding errors.
			if (result.length <= i) {
				result.push(weightedValues[0][1]);
				weightedValues.splice(0, 1);
			}
		}
		return result;
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

/** The method `Randomness.linearCongruential` returns a pseudorandom number generator constructor 
implemented with the [linear congruential algorithm](http://en.wikipedia.org/wiki/Linear_congruential_generator).
It also contain the following shortcuts to build common variants:
*/
Randomness.linearCongruential = function linearCongruential(m, a, c) {
	return function (seed) {
		var i = seed || 0;
		return new Randomness(function () {
			return (i = (a * i + c) % m) / m;
		});
	};
};

/** + `numericalRecipies(seed)`: builds a linear congruential pseudorandom number generator as it is 
specified in [Numerical Recipies](http://www.nr.com/).
*/
Randomness.linearCongruential.numericalRecipies = 
	Randomness.linearCongruential(0xFFFFFFFF, 1664525, 1013904223);

/** + `borlandC(seed)`: builds a linear congruential pseudorandom number generator as it used by
	Borland C/C++.
*/
Randomness.linearCongruential.borlandC = 
	Randomness.linearCongruential(0xFFFFFFFF, 22695477, 1);

/** + `glibc(seed)`: builds a linear congruential pseudorandom number generator as it used by
	[glibc](http://www.mscs.dal.ca/~selinger/random/).
*/
Randomness.linearCongruential.glibc = 
	Randomness.linearCongruential(0xFFFFFFFF, 1103515245, 12345);

// ### Mersenne twister ############################################################################

/** The method `Randomness.mersenneTwister` returns a pseudorandom number generator constructor 
implemented with the [Mersenne Twister algorithm](http://en.wikipedia.org/wiki/Mersenne_twister#Pseudocode).
*/
Randomness.mersenneTwister = (function (){
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
			if (y & 1 != 0) {
				numbers[i] = unsigned(numbers[i] ^ 0x9908B0DF);
			}
		}
	}

	return function (seed) {
		seed = isNaN(seed) ? Date.now() : seed|0;
		var numbers = initialize(seed),
			index = 0;
		return new Randomness(function () {
			if (index == 0) {
				generate(numbers);
			}
			var y = numbers[index];
			y = unsigned(y ^ (y << 11));
			y = unsigned(y ^ ((y >>> 7) & 0x9D2C5680));
			y = unsigned(y ^ ((y >>> 15) & 0xEFC60000));
			y = unsigned(y ^ (y << 18));
			index = (index + 1) % 624;
			return y / 0xFFFFFFFF;
		});
	};
})();