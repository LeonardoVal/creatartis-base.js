/* Simple unit testing.
*/	
var Verifier = exports.Verifier = declare({
	/** new Verifier(logger=Logger.ROOT):
		Unit testing helper constructor.
	*/
	constructor: function Verifier(logger) {
		this.logger = logger || Logger.ROOT;
		this.tests = [];
	},
	
	/** Verifier.test(testName, testFunction):
		Adds the testFunction to this verifier. If testName is not defined, the  
		testFunction's name is used.
	*/
	test: function test(testName, testFunction) {
		raiseIf(typeof testFunction != 'function', 'Verifier.append() expects a function.');
		this.tests.push([testName || testFunction.name, testFunction]);
	},
	
	/** Verifier.failure(level, message):
		Builds the error instance raised by fail().
	*/
	failure: function failure(level, message) {
		var error = new Error(message);
		error.isFailure = true;
		error.level = level;
		return error;
	},
	
	/** Verifier.fail(message...):
		Raises an Error with a isFailure property in true.
	*/
	fail: function fail() {
		throw this.failure('FAIL', Array.prototype.slice.call(arguments).join(''));
	},
	
	__logFailure__: function __logFailure__(id, err, message) {
		var suffix = "\n\t"+ callStack(err).slice(0, 10).join('\n\t');
		if (err && err.isFailure) {
			this.logger.log(err.level, "Test ", id, " failed after ", chronometer.time(), "ms. Failure: ", err.message, suffix);
		} else {
			this.logger.error("Test ", id, " aborted after ", chronometer.time(), "ms. Error: ", err, suffix);
		}
	},
	
	/** Verifier.run():
		Runs the tests and logs the result.
	*/
	run: function run() {
		var verifier = this,
			chronometer = new Chronometer(), 
			successful = 0;
		function __logFail__(id, err) {
			var suffix = "\n\t"+ callStack(err).slice(0, 10).join('\n\t');
			if (err && err.isFailure) {
				verifier.logger.log(err.level, "Test ", id, " failed after ", chronometer.time(), "ms. Failure: ", err.message, suffix);
			} else {
				verifier.logger.error("Test ", id, " aborted after ", chronometer.time(), "ms. Error: ", err, suffix);
			}
		}
		return Future.sequence(this.tests, function (entry) { // Run the tests.
			var id = entry[0], test = entry[1];
			chronometer.reset();
			try {
				return Future.invoke(test, verifier).then(function (output) {
					verifier.logger.log("OK", id, " passed after ", chronometer.time(), "ms. ", output);
					successful++;
				}, __logFail__.bind(verifier, id));
			} catch (err) {
				__logFail__.call(verifier, id, err);
			}
		}).then(function () {
			verifier.logger.info("Finished: ", successful, "/", verifier.tests.length, " tests were successful.");
		});
	},
	
	/** Verifier.todo(message...):
		Specific kind of failure indicating there is something pending or 
		missing in the implementation of the test. 
	*/
	todo: function todo() {
		this.logger.log('TODO', Array.prototype.slice.call(arguments).join(''));
	},
	
	__assert__: function __assert__(condition, args, i) {
		if (!condition) {
			var msg = (args.length > i ? Array.prototype.slice.call(args, i) : Array.prototype.slice.call(arguments, 3)).join('');
			this.fail(msg);
		}
	},
	
	/** Verifier.assert(condition, message...):
		Checks the condition and if it is false raises a failure. 
	*/
	assert: function assert(condition) {
		this.__assert__(condition, arguments, 1, "Assertion failed!");
	},
	
	/** Verifier.assertFalse(condition, message...):
		Analogue of assert but negating the condition. 
	*/
	assertFalse: function assert(condition) {
		this.__assert__(!condition, arguments, 1, "Assertion failed!");
	},
	
	/** Verifier.assertSucceeds(f):
		Runs the f (as a parameterless function) and fails if it the execution
		throws any exception. If the execution succeeds, returns the result.
	*/
	assertSucceeds: function assertSucceeds(f) {
		try {
			return f.call(this);
		} catch (err) {
			return this.fail('Execution of ', f.name || '\n'+ f +'\n', ' should not have failed but it did! The error was: ', err);
		}
	},
	
	/** Verifier.assertFails(f, errorType=Error):
		Runs the f (as a parameterless function) and fails if it executes without 
		throwing any exceptions. If the execution fails, catches the error and 
		returns it.
	*/
	assertFails: function assertFails(f, errorType) {
		try {
			return f.call(this);
		} catch (err) {
			if (errorType && !(err instanceof errorType)) {
				this.fail('Execution of \n', f.name || '\n'+ f +'\n', '\n should have failed with an error of type ', errorType, ' but raised ', err, '.');
			}
			return err;
		}
		return this.fail('Execution of \n', f.name || '\n'+ f +'\n', '\n should have failed but it did not!');
	},

	/** Verifier.assertNull(obj, msg...):
		Asserts that the object is null.
	*/	
	assertNull: function assertNull(obj) {
		this.__assert__(obj === null, arguments, 1,
			"Object ", obj, " should be null.");
	},
	
	/** Verifier.assertNotNull(obj, msg...):
		Asserts that the object is not null.
	*/
	assertNotNull: function assertNotNull(obj) {
		this.__assert__(obj !== null, arguments, 1,
			"Object ", obj, " should not be null.");
	},
		
	/** Verifier.assertUndefined(obj, msg...):
		Asserts that the object is undefined.
	*/
	assertUndefined: function (obj) {
		this.__assert__(obj === undefined, arguments, 1,
			"Object ", obj, " should be undefined.");
	},
	
	/** Verifier.assertDefined(obj, msg...):
		Asserts that the object is not undefined.
	*/
	assertDefined: function assertDefined(obj) {
		this.__assert__(obj !== undefined, arguments, 1,
			"Object ", obj, " should be defined.");
	},
	
	/** Verifier.assertEqual(expected, obtained, msg...):
		Asserts that both values are equal (==).
	*/
	assertEqual: function assertEqual(expected, obtained) {
		this.__assert__(expected == obtained, arguments, 2,
			"Value ", obtained, " should be equal (==) to ", expected, ".");
	},

	/** Verifier.assertNotEqual(expected, obtained, msg...):
		Asserts that both objects are not equal (!=).
	*/
	assertNotEqual: function assertNotEqual(expected, obtained) {
		this.__assert__(expected != obtained, arguments, 2,
			"Value ", obtained, " should not be equal (!=) to ", expected, ".");
	},
	
	/** Verifier.assertSame(expected, obtained, msg...):
		Asserts that both values are the same value (===).
	*/
	assertSame: function assertSame(expected, obtained) {
		this.__assert__(expected === obtained, arguments, 2,
			"Value ", obtained, " should be the same (===) as ", expected, ".");
	},

	/** Verifier.assertNotSame(expected, obtained, msg...):
		Asserts that both objects are not the same value (!==).
	*/
	assertNotSame: function assertNotSame(expected, obtained) {
		this.__assert__(expected !== obtained, arguments, 2,
			"Value ", obtained, " should not be the same (!==) as ", expected, ".");
	},
	
	/** Verifier.EPSILON=2^(-32):
		Default threshold used in for numerical difference in some assert 
		methods (e.g. assertAlmostEqual).
	*/
	EPSILON: 1 / 0x10000000,
	
	/** Verifier.assertAlmostEqual(expected, obtained, threshold, msg...):
		Asserts that both numbers' difference is not greater than threshold.
	*/
	assertAlmostEqual: function assertAlmostEqual(expected, obtained, threshold) {
		threshold = isNaN(threshold) ? this.EPSILON : +threshold;
		this.__assert__(Math.abs(expected - obtained) <= threshold, arguments, 3, 
			"Value ", obtained, " should not be so different (up to ", threshold, ") of ", expected, ".");
	},
	
	/** Verifier.assertInstanceOf(constructor, object, msg...):
		Asserts that the object is instance of the constructor.
	*/
	assertInstanceOf: function assertInstanceOf(constructor, object) {
		this.__assert__(object instanceof constructor, arguments, 2, 
			"Object ", object, " should be an instance of ", constructor, ".");
	},
	
	/** Verifier.assertIsFunction(value, msg...):
		Asserts that the value is a function.
	*/
	assertIsFunction: function assertIsFunction(value) {
		this.__assert__(typeof value === 'function', arguments, 1,
			"Value ", value," is not a function.");
	},
	
	/** Verifier.assertIsArray(expected, obtained, msg...):
		Asserts the obtained value is an array with equal elements to expected.
	*/
	assertIsArray: function assertIsArray(expected, obtained) {
		this.__assert__(Array.isArray(expected), arguments, 2, "Expected value is not an Array.");
		this.__assert__(Array.isArray(obtained), arguments, 2, JSON.stringify(obtained), " is not an Array.");
		this.__assert__(expected.length === obtained.length, arguments, 2,
			"Expected an array of ", expected.length, " elements, instead of ", obtained.length, " elements.");
		for (var i = 0; i < expected.length; i++) {
			this.__assert__(expected[i] == obtained[i], arguments, 2, 
				"Value ", obtained[i], " at ", i, " should be equal (==) to ", expected[i], ".");
		}		
	}
}); // declare Verifier.