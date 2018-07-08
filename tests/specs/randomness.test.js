define(['creatartis-base'], function (base) {
	var Randomness = base.Randomness,
		DEFAULT = Randomness.DEFAULT,
		iterable = base.iterable;

	function __constantRandom__(k) { // Trust me, it makes sense in the end.
		return new Randomness(function () {
			return k;
		});
	}

	/**	Generic pseudorandom generator testing procedure. See: <http://www.johndcook.com/Beautiful_Testing_ch10.pdf>.
	*/
	function testRandomGenerator(name, constructor) {
		var seeds = [123, 123456, 978654, (new Date()).getTime()],
			SAMPLE_COUNT = 1000;
		iterable(seeds).forEach(function (seed) {
			var generator = constructor(seed), value, sum = 0.0;
			for (var i = 0; i < SAMPLE_COUNT; i++) {
				value = generator.random();
				sum += value;
				// Range tests.
				expect(value).not.toBeLessThan(0);
				expect(value).toBeLessThan(1);
			}
			var mean = sum / SAMPLE_COUNT; // Mean test. Warning! May fail upto 0.3% of the times.
			expect(Math.abs(0.5 - mean) <= 3 * 0.5 / Math.sqrt(SAMPLE_COUNT)).toBe(true);
			//TODO Variance test?
			//TODO Chi2 test aka bucket test?
			//TODO Kolomogorov-Smirnov.
		});
	}

	describe("Randomness", function () { ///////////////////////////////////////
		it("DEFAULT", function () {
			expect(new Randomness().__random__).toBe(Math.random);
			expect(Randomness.DEFAULT).toBeDefined();
			expect(Randomness.DEFAULT.__random__).toBe(Math.random);
			for (var i = 0; i < 30; i++) {
				var r = Randomness.DEFAULT.random();
				expect(0 <= r && r < 1).toBe(true);
			}
		});

		it("constant generators", function () {
			var rand0 = __constantRandom__(0),
				rand1 = __constantRandom__(1);
			for (var i = 0; i < 30; i++) {
				expect(rand0.random()).toBe(0);
				expect(rand0.random(3)).toBe(0);
				expect(rand0.random(3, 7)).toBe(3);
				expect(rand1.random()).toBe(1);
				expect(rand1.random(3)).toBe(3);
				expect(rand1.random(3, 7)).toBe(7);
			}
		});

		it("random()", function () {
			var min, max, r;
			for (var i = 0; i < 30; i++) {
				min = DEFAULT.random() * 10;
				max = min + DEFAULT.random() * 10;
				r = DEFAULT.random(max);
				expect(0 <= r).toBe(true);
				expect(0 < max ? r < max : r <= max).toBe(true);
				r = DEFAULT.random(min, max);
				expect(min <= r).toBe(true);
				expect(min < max ? r < max : r <= max).toBe(true);
			}
		});

		it("randomInt()", function () {
			var min, max, r;
			for (var i = 0; i < 30; i++) {
				min = Math.floor(DEFAULT.random() * 10);
				max = Math.floor(min + DEFAULT.random() * 10);
				r = DEFAULT.randomInt(max);
				expect(r).toEqual(Math.floor(r));
				expect(0 <= r).toBe(true);
				expect(0 < max ? r < max : r <= max).toBe(true);
				r = DEFAULT.randomInt(min, max);
				expect(r).toEqual(Math.floor(r));
				expect(min <= r).toBe(true);
				expect(min < max ? r < max : r <= max).toBe(true);
			}
		});

		it("randomBool()", function () {
			for (var i = 0; i < 30; i++) {
				expect(DEFAULT.randomBool()).toBeOfType('boolean');
			}
			var rand0 = __constantRandom__(0),
				rand0_4 = __constantRandom__(0.4),
				rand0_6 = __constantRandom__(0.6),
				rand1 = __constantRandom__(1);
			for (i = 0; i < 30; i++) {
				expect(rand0.randomBool()).toBe(true);
				expect(rand1.randomBool()).toBe(false);
				expect(rand0_4.randomBool()).toBe(true); // Default probability should be 0.5.
				expect(rand0_6.randomBool()).toBe(false);
				expect(rand0_4.randomBool(0.4)).toBe(false);
				expect(rand0_6.randomBool(0.6)).toBe(false);
				expect(rand0_4.randomBool(0.3)).toBe(false);
				expect(rand0_6.randomBool(0.5)).toBe(false);
				expect(rand0_4.randomBool(0.5)).toBe(true);
				expect(rand0_6.randomBool(0.7)).toBe(true);
			}
		});

		it("choice()", function () {
			expect(DEFAULT.choice.bind(DEFAULT, undefined)).toThrow();
			expect(DEFAULT.choice.bind(DEFAULT, null)).toThrow();
			expect(DEFAULT.choice(''), 'Randomness.choice("") is not undefined!').toBeUndefined();
			expect(DEFAULT.choice([]), 'Randomness.choice([]) is not undefined!').toBeUndefined();
			expect(DEFAULT.choice({}), 'Randomness.choice({}) is not undefined!').toBeUndefined();

			var test = [1,2,3,4,5], choice;
			for (var i = 0; i < 30; i++) {
				expect(DEFAULT.choice([1])).toBe(1);
				choice = DEFAULT.choice(test);
				expect(test.indexOf(choice)).not.toBeLessThan(0);
			}
			test = 'abcde';
			for (i = 0; i < 30; i++) {
				expect(DEFAULT.choice(['a'])).toBe('a');
				choice = DEFAULT.choice(test);
				expect(test.indexOf(choice)).not.toBeLessThan(0);
			}
			test = {a:1, b:2, c:3, d:4, e:5};
			for (i = 0; i < 30; i++) {
				expect('a1', DEFAULT.choice({a: 1}).join('')).toBe('a1');
				choice = DEFAULT.choice(test);
				expect(choice[1]).toBe(test[choice[0]]);
			}
		});

		it("split()", function () {
			expect(DEFAULT.split.bind(DEFAULT, undefined)).toThrow();
			expect(DEFAULT.split.bind(DEFAULT, null)).toThrow();

			['', [], 'a', [1], 'abc', [1,2,3,4,5]].forEach(function (test) {
				var testArray = iterable(test).toArray(), split;
				for (var i = 0; i < 30; i++) {
					split = DEFAULT.split(i % (testArray.length + 1), test);
					expect(Array.isArray(split)).toBe(true);
					expect(2, split.length).toBe(2);
					expect(Array.isArray(split[0])).toBe(true);
					expect(Array.isArray(split[1])).toBe(true);
					iterable(split[0]).forEach(function (x) {
						expect(testArray).toContain(x);
						expect(split[1]).not.toContain(x);
					});
					iterable(split[1]).forEach(function (x) {
						expect(testArray).toContain(x);
						expect(split[0]).not.toContain(x);
					});
				}
			});
		});

		it("choices()", function () {
			expect(DEFAULT.choices.bind(DEFAULT, undefined)).toThrow();
			expect(DEFAULT.choices.bind(DEFAULT, null)).toThrow();

			['', [], 'a', [1], 'abc', [1,2,3,4,5]].forEach(function (test) {
				var testArray = iterable(test).toArray(), choices;
				for (var i = 0; i < 30; i++) {
					choices = DEFAULT.choices(i % (testArray.length + 1), testArray);
					expect(Array.isArray(choices)).toBe(true);
					choices.forEach(function (x) {
						expect(testArray).toContain(x);
					});
				}
			});
		});

		it("shuffle()", function () {
			expect(DEFAULT.shuffle.bind(DEFAULT, undefined)).toThrow();
			expect(DEFAULT.shuffle.bind(DEFAULT, null)).toThrow();

			['', [], 'a', [1], 'abc', [1,2,3,4,5]].forEach(function (test) {
				var testArray = iterable(test).toArray(), shuffled;
				for (var i = 0; i < 30; i++) {
					shuffled = DEFAULT.shuffle(test);
					expect(Array.isArray(shuffled)).toBe(true);
					shuffled.forEach(function (x) {
						expect(testArray).toContain(x);
					});
					expect(shuffled.length).toBe(testArray.length);
				}
			});
		});

		it("normalizeWeights()", function () {
			expect(DEFAULT.normalizeWeights.bind(DEFAULT, undefined)).toThrow();
			expect(DEFAULT.normalizeWeights.bind(DEFAULT, null)).toThrow();
			
			expect(DEFAULT.normalizeWeights([]).toArray())
				.toEqual([]);
			expect(DEFAULT.normalizeWeights([['a', 1]]).toArray())
				.toEqual([['a', 1]]);
			expect(DEFAULT.normalizeWeights([['a', 1], ['b', 0]]).toArray())
				.toEqual([['a', 1], ['b', 0]]);
			expect(DEFAULT.normalizeWeights([['a', 1], ['b', 1]]).toArray())
				.toEqual([['a', 0.5], ['b', 0.5]]);
			expect(DEFAULT.normalizeWeights([['a', 1], ['b', 3]]).toArray())
				.toEqual([['a', 0.25], ['b', 0.75]]);
			expect(DEFAULT.normalizeWeights([['a', 1], ['b', 2], ['c', 1]]).toArray())
				.toEqual([['a', 0.25], ['b', 0.5], ['c', 0.25]]);

			// Fail with negative weights.
			expect(DEFAULT.normalizeWeights.bind(DEFAULT, [['a', -1]])).toThrow();
			expect(DEFAULT.normalizeWeights.bind(DEFAULT, [['a', 1], ['b', -0.5]])).toThrow();
		});

		it("linearCongruential generators", function () {
			expect(Randomness.LinearCongruential).toBeOfType('function');

			var nr = Randomness.LinearCongruential.numericalRecipies;
			expect(nr).toBeOfType('function');
			testRandomGenerator('LinearCongruential.numericalRecipies', nr);

			var bc = Randomness.LinearCongruential.borlandC;
			expect(bc).toBeOfType('function');
			testRandomGenerator('LinearCongruential.borlandC', bc);

			var gc = Randomness.LinearCongruential.glibc;
			expect(gc).toBeOfType('function');
			testRandomGenerator('LinearCongruential.glibc', gc);
		});

		it("Mersenne Twister generator", function () {
			expect(Randomness.MersenneTwister).toBeOfType('function');
			testRandomGenerator('MersenneTwister', function (seed) {
				return new Randomness.MersenneTwister(seed);
			});
		});
	}); //// describe.
}); //// define.
