/** tests/test_async.js:
	Test cases for the module <src/async.js>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis'], function (basis) {
	var verifier = new basis.Verifier();
	var Future = basis.Future;
	
	function assertState(future, state) {
		verifier.assertEqual(state, future.state, 'Future state should be ', state, ' but is ', future.state, '.');
		verifier.assertEqual(state === 0, future.isPending());
		verifier.assertEqual(state === 1, future.isResolved());
		verifier.assertEqual(state === 2, future.isRejected());
		verifier.assertEqual(state === 3, future.isCancelled());
	}
	
	function rejectedFuture(msg) {
		var result = new Future();
		result.fail(function (reason) { 
			// Prevent the rejection to be thrown.
		});
		result.reject(new Error(msg || ''));
		return result;
	}
	
/*	Checks that once the Future is fulfilled it remains so, and the 
	correspondance between state and 'isX' methods.
*/
	verifier.test("Future (state transitions)", function () {	
		var future;
		assertState(future = new Future(), 0);
		assertState(future.resolve(), 1);
		assertState(future.reject(), 1);
		assertState(future.cancel(), 1);
		
		assertState(future = new Future(), 0);
		future.fail(function (reason) { // Prevent the rejection to be thrown.
			verifier.assertUndefined(reason);
		});
		assertState(future.reject(), 2);
		assertState(future.resolve(), 2);
		assertState(future.cancel(), 2);
		
		assertState(future = new Future(), 0);
		assertState(future.cancel(), 3);
		assertState(future.resolve(), 3);
		assertState(future.reject(), 3);
	});
	
/*	Checks if the proper callbacks are called when the future is resolved.
*/
	verifier.test("Future (resolution)", function () {
		var future = new Future(),
			resolution = Math.random(),	test;
		test = future.then(function done(value) {
			verifier.assertEqual(resolution, value);
		}, function fail(reason) {
			verifier.fail('onRejected called on resolved future.')
		});
		future.resolve(resolution);
		return test;
	});
	
/*	Checks if the proper callbacks are called when the future is rejected.
*/
	verifier.test("Future (rejection)", function () {
		var future = new Future(), 
			rejection = Math.random(), test;
		test = future.then(function done(value) {
			verifier.fail('onResolved called on rejected future.')
		}, function fail(reason) {
			if (typeof reason !== 'number') { // If reason is not a number...
				throw error; // ... then is an error that must be raised.
			}
			verifier.assertEqual(rejection, reason);
		});
		future.reject(rejection);
		return test;
	});
	
/*	Checks no callbacks are called (except special 'onCancel' ones) when the 
	future is cancelled.
*/	
	verifier.test("Future (cancellation)", function () {
		var test = new Future(),
			result = new Future();
		test.done(function () {
			result.reject(verifier.failure('Cancelled future should not call done callbacks.'));
		});
		test.fail(function () {
			result.reject(verifier.failure('Cancelled future should not call fail callbacks.'));
		});
		test.__onCancel__(function () {
			result.resolve();
		});
		test.cancel()
		return result;
	});

/*	Checks the future chaining using then() with asynchronous functions; i.e.
	functions that return futures themselves.
*/
	verifier.test("Future (chaining)", function () {
		verifier.todo("Check the future chaining using then() with asynchronous functions; i.e. functions that return futures themselves.");
	});

/*	Checks the behaviour of when().
*/
	verifier.test("when()", function () {
	// One value.
		var future1 = Future.when(123);
		this.assert(future1 instanceof Future);
		this.assert(future1.isResolved);
	// One future.
		var future2 = new Future();
		this.assertSame(future2, Future.when(future2));
	// No values.
		var future3 = Future.when();
		this.assert(future3 instanceof Future);
		this.assert(future3.isPending);
	// Check resolutions.
		return future1.then(function (x) {
			verifier.assertEqual(123, x);
		});
	});
	
	verifier.todo("Future.doWhile()");
	verifier.todo("Future.whileDo()");
	verifier.todo("Future.sequence()");
	
/*	Checks the behaviour of all().
*/
	verifier.test("Future.all()", function () {
	// All resolved first.
		return Future.sequence(basis.Iterable.range(30), function (n) {
			var values = basis.Iterable.range(n + 1).toArray(),
				futures = values.map(Future.when);
			return Future.all(futures).then(function (r) {
				verifier.assertIsArray(values, r);
			});
		}).then(function () {
	// Some rejected first.	
			return Future.sequence(basis.Iterable.range(30), function (n) {
				var values = basis.Iterable.range(n + 1).toArray(),
					reject = Math.random() * (n + 1) >> 0,
					futures = values.map(function (v, i) {
						return i == reject || Math.random() < 1/n ? rejectedFuture('error@'+ n) : Future.when(v);
					});
				return Future.all(futures).then(function (r) {
					verifier.fail("Future.all() with rejected elements should have been rejected.");
				}, function (e) {
					verifier.assertInstanceOf(Error, e);
					verifier.assertEqual('error@'+ n, e.message);
				});
			});
		}).then(function () {
	// All resolved deferred.
			return Future.sequence(basis.Iterable.range(30), function (n) {
				var values = basis.Iterable.range(n + 1).toArray(),
					futures = basis.Iterable.range(n + 1).map(function (v, i) {
						return new Future();
					}).toArray();
				futures.forEach(function (f, i) { // Asynchronous deferred resolutions.
					setTimeout(f.resolve.bind(f, i), 10 + Math.random() * 10);
				});
				return Future.all(futures).then(function (r) {
					verifier.assertIsArray(values, r);
				});
			});
		}).then(function () {
	// All some rejected deferred.
			return Future.sequence(basis.Iterable.range(30), function (n) {
				var values = basis.Iterable.range(n + 1).toArray(),
					reject = Math.random() * (n + 1) >> 0,
					futures = basis.Iterable.range(n + 1).map(function (v, i) {
						return new Future();
					}).toArray();
				futures.forEach(function (f, i) { // Asynchronous deferred resolutions and rejections.
					if (i == reject || Math.random() < 1/n) {
						setTimeout(f.reject.bind(f, new Error('error@'+ n)), 1 + Math.random() * 10);
					} else {
						setTimeout(f.resolve.bind(f, i), 10 + Math.random() * 10);
					}
				});
				return Future.all(futures).then(function (r) {
					verifier.fail("Future.all() with rejected elements should have been rejected.");
				}, function (e) {
					verifier.assertInstanceOf(Error, e);
					verifier.assertEqual('error@'+ n, e.message);
				});
			});
		});
	});

/*	Checks the behaviour of any().
*/
	verifier.todo("Future.any()");
	
	verifier.test("Future.delay()", function () {
		var timestamp = Date.now();
		return Future.delay(100).then(function (v) {
			var now = Date.now();
			verifier.assert(v >= timestamp, "Future.delay() default value is less than the timestamp.");
			verifier.assert(now >= timestamp + 100, "Future.delay() triggered to soon (after ", now - timestamp, "ms).");
		});
	});
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});