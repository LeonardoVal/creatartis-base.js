/** tests/test_randomness.js:
	Test cases for the module <randomness.js>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis'], function (basis) {
	var verifier = new basis.Verifier(),
		Randomness = basis.Randomness,
		DEFAULT = Randomness.DEFAULT,
		iterable = basis.iterable;
	
	function __constantRandom__(k) { // Trust me, it makes sense in the end.
		return new Randomness(function () { 
			return k; 
		});
	}
	
/*	Checks the proper shape of the module's basic definitions.
*/
	verifier.test("Randomness.DEFAULT", function () {
		this.assert(new Randomness().__random__ == Math.random, 'Default generator is not Math.random.');
		this.assert(Randomness.DEFAULT, 'Randomness.DEFAULT is not defined.');
		this.assert(Randomness.DEFAULT.__random__ == Math.random, 'Randomness.DEFAULT does not use Math.random.');
		for (var i = 0; i < 30; i++) {
			var r = Randomness.DEFAULT.random();
			this.assert(0 <= r && r < 1, 'Randomness.DEFAULT.random returned a number outside [0,1).');
		}
	});
	
/*	Checks the Randomness.random function with a generator that always returns 
	the same value.
*/
	verifier.test("Randomness (constant generator)", function () {
		var rand0 = __constantRandom__(0),
			rand1 = __constantRandom__(1);
		for (var i = 0; i < 30; i++) {
			this.assertEqual(0, rand0.random());
			this.assertEqual(0, rand0.random(3));
			this.assertEqual(3, rand0.random(3, 7));
			this.assertEqual(1, rand1.random());
			this.assertEqual(3, rand1.random(3));
			this.assertEqual(7, rand1.random(3, 7));
		}
	});
	
/*	Checks the Randomness.random and randomInt function with a generator that 
	always returns the same value.
*/
	verifier.test("Randomness.random()", function () {
		var min, max, r;
		for (var i = 0; i < 30; i++) {
			min = DEFAULT.random() * 10;
			max = min + DEFAULT.random() * 10;
			r = DEFAULT.random(max);
			this.assert(0 <= r, 'Randomness.random(', max, ') => ', r, ' cannot be less than 0.');
			this.assert(0 < max ? r < max : r <= max, 
				'Randomness.random(', max, ') => ', r, ' cannot be greater than or equal to max.');
			r = DEFAULT.random(min, max);
			this.assert(min <= r, 'Randomness.random(', min, ', ', max, ') => ', r, ' cannot be less than min.');
			this.assert(min < max ? r < max : r <= max, 
				'Randomness.random(', min, ', ', max, ') => ', r, ' cannot be greater than or equal to max.');
		}
	});

	verifier.test("Randomness.randomInt()", function () {
		var min, max, r;
		for (var i = 0; i < 30; i++) {
			min = Math.floor(DEFAULT.random() * 10);
			max = Math.floor(min + DEFAULT.random() * 10);
			r = DEFAULT.randomInt(max);
			this.assert(r == Math.floor(r), 'Randomness.randomInt(', max, ') => ', r, ' must be an integer.');
			this.assert(0 <= r, 'Randomness.random(', max, ') => ', r, ' cannot be less than 0.');
			this.assert(0 < max ? r < max : r <= max, 
				'Randomness.random(', max, ') => ', r, ' cannot be greater than or equal to max.');
			r = DEFAULT.randomInt(min, max);
			this.assert(r == Math.floor(r), 'Randomness.randomInt(', min, ', ', max, ') => ', r, ' must be an integer.');
			this.assert(min <= r, 'Randomness.random(', min, ', ', max, ') => ', r, ' cannot be less than min.');
			this.assert(min < max ? r < max : r <= max, 
				'Randomness.random(', min, ', ', max, ') => ', r, ' cannot be greater than or equal to max.');
		}
	});
	
/*	Checks the Randomness.randomBool function with a generator that always 
	returns the same value.
*/
	verifier.test("Randomness.randomBool()", function () {
		this.assertEqual('function', typeof DEFAULT.randomBool);
		for (var i = 0; i < 30; i++) {
			this.assertEqual('boolean', typeof DEFAULT.randomBool(), 'Randomness.randomBool result is not a boolean.');
		}
		var rand0 = __constantRandom__(0),
			rand0_4 = __constantRandom__(0.4),
			rand0_6 = __constantRandom__(0.6),
			rand1 = __constantRandom__(1);
		for (i = 0; i < 30; i++) {
			this.assert(rand0.randomBool());
			this.assertFalse(rand1.randomBool());
			this.assert(rand0_4.randomBool()); // Default probability should be 0.5.
			this.assertFalse(rand0_6.randomBool());
			this.assertFalse(rand0_4.randomBool(0.4));
			this.assertFalse(rand0_6.randomBool(0.6));
			this.assertFalse(rand0_4.randomBool(0.3));
			this.assertFalse(rand0_6.randomBool(0.5));
			this.assert(rand0_4.randomBool(0.5));
			this.assert(rand0_6.randomBool(0.7));
		}
	});

/*	Checks the Randomness.choice function on the DEFAULT generator.
*/
	verifier.test("Randomness.choice()", function () {
		this.assertFails(DEFAULT.choice.bind(DEFAULT, undefined));
		this.assertFails(DEFAULT.choice.bind(DEFAULT, null));
		this.assertUndefined(DEFAULT.choice(''), 'Randomness.choice("") is not undefined!');
		this.assertUndefined(DEFAULT.choice([]), 'Randomness.choice([]) is not undefined!');
		this.assertUndefined(DEFAULT.choice({}), 'Randomness.choice({}) is not undefined!');
		
		var test = [1,2,3,4,5], choice;
		for (var i = 0; i < 30; i++) {
			this.assertEqual(1, DEFAULT.choice([1]));
			choice = DEFAULT.choice(test);
			this.assert(test.indexOf(choice) >= 0, 'Randomness.choice(', JSON.stringify(test), ') => ', choice, '!');
		}
		test = 'abcde';
		for (i = 0; i < 30; i++) {
			this.assertEqual('a', DEFAULT.choice(['a']));
			choice = DEFAULT.choice(test);
			this.assert(test.indexOf(choice) >= 0, 'Randomness.choice("', test, '") => ', choice, '!');
		}
		test = {a:1, b:2, c:3, d:4, e:5};
		for (i = 0; i < 30; i++) {
			this.assertEqual('a1', DEFAULT.choice({a: 1}).join(''));
			choice = DEFAULT.choice(test);
			this.assertEqual(choice[1], test[choice[0]], 'Randomness.choice(', JSON.stringify(test), ') => ', choice, '!');
		}
	});

/*	Checks the Randomness.split function on the DEFAULT generator.
*/
	verifier.test("Randomness.split()", function () {
		this.assertFails(DEFAULT.split.bind(DEFAULT, undefined));
		this.assertFails(DEFAULT.split.bind(DEFAULT, null));

		['', [], 'a', [1], 'abc', [1,2,3,4,5]].forEach(function (test) {
			var testArray = iterable(test).toArray(), split;
			for (var i = 0; i < 30; i++) {
				split = DEFAULT.split(i % (testArray.length + 1), test);
				verifier.assert(Array.isArray(split));
				verifier.assertEqual(2, split.length);
				verifier.assert(Array.isArray(split[0]));
				verifier.assert(Array.isArray(split[1]));
				iterable(split[0]).forEach(function (x) {
					verifier.assert(testArray.indexOf(x) >= 0);
					verifier.assert(split[1].indexOf(x) < 0);
				});
				iterable(split[1]).forEach(function (x) {
					verifier.assert(testArray.indexOf(x) >= 0);
					verifier.assert(split[0].indexOf(x) < 0);
				});
			}
		});
	});

/*	Checks the Randomness.choices function on the DEFAULT generator.
*/
	verifier.test("Randomness.choices()", function () {
		this.assertFails(DEFAULT.choices.bind(DEFAULT, undefined));
		this.assertFails(DEFAULT.choices.bind(DEFAULT, null));

		['', [], 'a', [1], 'abc', [1,2,3,4,5]].forEach(function (test) {
			var testArray = iterable(test).toArray(), choices;
			for (var i = 0; i < 30; i++) {
				choices = DEFAULT.choices(i % (testArray.length + 1), testArray);
				verifier.assert(Array.isArray(choices));
				choices.forEach(function (x) {
					verifier.assert(testArray.indexOf(x) >= 0);
				});
			}
		});
	});

/*	Checks the Randomness.shuffle function on the DEFAULT generator.
*/
	verifier.test("Randomness.shuffle()", function () {
		this.assertFails(DEFAULT.shuffle.bind(DEFAULT, undefined));
		this.assertFails(DEFAULT.shuffle.bind(DEFAULT, null));

		['', [], 'a', [1], 'abc', [1,2,3,4,5]].forEach(function (test) {
			var testArray = iterable(test).toArray(), shuffled;
			for (var i = 0; i < 30; i++) {
				shuffled = DEFAULT.shuffle(test);
				verifier.assert(Array.isArray(shuffled));
				shuffled.forEach(function (x) {
					verifier.assert(testArray.indexOf(x) >= 0);
				});
				verifier.assertEqual(testArray.length, shuffled.length);
			}
		});
	});

/*	Generic pseudorandom generator testing procedure.
	References:
	* <http://www.johndcook.com/Beautiful_Testing_ch10.pdf>.
*/
	function testRandomGenerator(name, constructor) {
		var seeds = [123, 123456, 978654, (new Date()).getTime()],
			SAMPLE_COUNT = 10000;
		iterable(seeds).forEach(function (seed) {
			var generator = constructor(seed), value, sum = 0.0;
			for (var i = 0; i < SAMPLE_COUNT; i++) {
				value = generator.random();
				sum += value;
				// Range tests.
				verifier.assert(value >= 0, 'Generator ', name, ' returned a negative value: ', value, '.');
				verifier.assert(value < 1, 'Generator ', name, ' returned a value >= 1: ', value, '.');
			}
			// Mean test. Warning! May fail upto 0.3% of the times.
			var mean = sum / SAMPLE_COUNT;
			verifier.assert(Math.abs(0.5 - mean) <= 3 * 0.5 / Math.sqrt(SAMPLE_COUNT), 
				"Mean test for generator ", name, " fail with ", mean, " (0.5).");
			//TODO Variance test?
			//TODO Chi2 test aka bucket test?
			//TODO Kolomogorov-Smirnov.
		});
	}
	
/*	Check the pseudorandom generation algorithms.
*/
	verifier.test("Randomness.linearCongruential generators", function () {
		verifier.assertIsFunction(Randomness.linearCongruential);
		verifier.assertIsFunction(Randomness.linearCongruential.numericalRecipies);
		testRandomGenerator('linearCongruential.numericalRecipies', Randomness.linearCongruential.numericalRecipies);
		verifier.assertIsFunction(Randomness.linearCongruential.borlandC);
		testRandomGenerator('linearCongruential.borlandC', Randomness.linearCongruential.borlandC);
		verifier.assertIsFunction(Randomness.linearCongruential.glibc);
		testRandomGenerator('linearCongruential.glibc', Randomness.linearCongruential.glibc);
	});
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});

//TODO weightedChoice.