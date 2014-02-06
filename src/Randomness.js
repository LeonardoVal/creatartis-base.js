/** basis/randomness.js:
	Pseudorandom number generation algorithms and related functions.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Randomness //////////////////////////////////////////////////////////////////

var Randomness = exports.Randomness = declare({
	/** new Randomness(generator):
		Pseudorandom number generator constructor, based on a generator 
		function. This is a function that is called without any parameters and 
		returns a random number between 0 (inclusive) and 1 (exclusive). If none 
		is given the standard Math.random() is used.
	*/
	constructor: function Randomness(generator) {
		this.__random__ = generator || Math.random;
	},

	/** Randomness.random(x, y):
		Called without arguments returns a random number in [0,1). Called with 
		only the first argument x, returns a random number in [0, x). Called 
		with both arguments return a random number in [x,y).
	*/
	random: function random() {
		var n = this.__random__();
		switch (arguments.length) {
			case 0: return n;
			case 1: return n * arguments[0];
			default: return (1 - n) * arguments[0] + n * arguments[1];
		}
	},

	/** Randomness.randomInt(x, y):
		Same as with Randomness.random(x,y) but returns integers instead.
	*/
	randomInt: function randomInt() {
		return Math.floor(this.random.apply(this, arguments));
	},

	/** Randomness.randomBool(p=0.5):
		Returns true with a probability of p, else false. By default p = 0.5 is assumed.
	*/
	randomBool: function randomBool(prob) {
		return this.random() < (isNaN(prob) ? 0.5 : +prob);
	},

	// Sequence handling ///////////////////////////////////////////////////////

	/** Randomness.randoms(n, x, y):
		Builds an array of n random numbers calling Randomness.random(x, y).
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

	/** Randomness.choice(xs):
		Randomnly selects an element from the iterable xs. If more than one is 
		given, the element is chosen from the argument list.
	*/
	choice: function choice(from) {
		from = arguments.length > 1 ? Array.prototype.slice.call(arguments) : 
			Array.isArray(from) ? from : 
			iterable(from).toArray();
		return from.length < 1 ? undefined : from[this.randomInt(from.length)];
	},

	/** Randomness.split(n, xs):
		Take n elements from xs randomnly. Returns an array [A,B] with A being
		the taken elements and B the remaining. If more than two arguments are 
		given, elements are taken from the second argument on.
	*/
	split: function split(n, from) {
		from = arguments.length > 2 ? Array.prototype.slice.call(arguments) : iterable(from).toArray();
		var r = [];
		for (n = Math.min(from.length, Math.max(+n, 0)); n > 0; n--) {
			r = r.concat(from.splice(this.randomInt(from.length), 1));
		}
		return [r, from];
	},

	/** Randomness.choices(n ,xs):
		Randomnly selects n elements from xs. If more than two arguments are 
		given, the arguments from 1 and on are considered as xs.
	*/
	choices: function choices(n, from) {
		return this.split.apply(this, arguments)[0];
	},

	/** Randomness.shuffle(xs):
		Randomnly rearranges elements in xs. Returns a copy.
	*/
	shuffle: function shuffle(elems) {
		//TODO This can be optimized by making random swaps.
		return this.choices(elems.length, elems);
	},

	/** Randomness.weightedChoices(n, weightedValues):
		Chooses n values from weighted values randomly, such that each value's 
		probability of being selected is proportional to its weight. The 
		weightedValues must be an iterable of pairs [weight, value]. 
		Weights are normalized, but if there are negative weights, the minimum 
		value has probability zero.
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
		// Normalize weights.
		sum -= min * length;
		weightedValues = iterable(weightedValues).map(function (weightedValue) {
			return [(weightedValue[0] - min) / sum, weightedValue[1]]
		}).toArray();
		// Make selection.
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
			// Fallback when no element has been selected. Unprobable, but may happen due to rounding errors.
			if (result.length <= i) {
				result.push(weightedValues[0][1]);
				weightedValues.splice(0, 1);
			}
		}
		return result;
	},

	// Distributions ///////////////////////////////////////////////////////////

	/** Randomness.averagedDistribution(times):
		Returns another Randomness instance based on this one, but generating
		numbers by averaging its random values a given number of times. The 
		result is an aproximation to the normal distribution as times increases.
		By default times = 2 is assumed.
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
}); // declare Randomness.

// DEFAULT generator ///////////////////////////////////////////////////////////

/** static Randomness.DEFAULT:
	Default static instance, provided for convenience. Uses Math.random().
*/
Randomness.DEFAULT = new Randomness();

['random', 'randomInt', 'randomBool', 'choice', 'split', 'choices', 'shuffle',
 'averagedDistribution'
].forEach(function (id) {
	Randomness[id] = Randomness.DEFAULT[id].bind(Randomness.DEFAULT);
});

// Algorithms //////////////////////////////////////////////////////////////////

	// Linear congruential /////////////////////////////////////////////////////

/** static Randomness.linearCongruential(m, a, c):
	Returns a pseudorandom number generator constructor implemented with the 
	linear congruential algorithm. 
	See <http://en.wikipedia.org/wiki/Linear_congruential_generator>.
*/
Randomness.linearCongruential = function linearCongruential(m, a, c) {
	return function (seed) {
		var i = seed || 0;
		return new Randomness(function () {
			return (i = (a * i + c) % m) / m;
		});
	};
};

/** static Randomness.linearCongruential.numericalRecipies(seed):
	Builds a linear congruential pseudorandom number generator as it is specified
	in Numerical Recipies. See <http://www.nr.com/>.
*/
Randomness.linearCongruential.numericalRecipies = 
	Randomness.linearCongruential(0xFFFFFFFF, 1664525, 1013904223);

/** static Randomness.linearCongruential.numericalRecipies(seed):
	Builds a linear congruential pseudorandom number generator as it used by
	Borland C/C++.
*/
Randomness.linearCongruential.borlandC = 
	Randomness.linearCongruential(0xFFFFFFFF, 22695477, 1);

/** static Randomness.linearCongruential.numericalRecipies(seed):
	Builds a linear congruential pseudorandom number generator as it used by
	glibc. See <http://www.mscs.dal.ca/~selinger/random/>.
*/
Randomness.linearCongruential.glibc = 
	Randomness.linearCongruential(0xFFFFFFFF, 1103515245, 12345);
