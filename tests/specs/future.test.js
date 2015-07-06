define(['base'], function (base) {
	var Future = base.Future;
	
	function expectState(future, state) {
		expect(future.state).toEqual(state);
		expect(future.isPending()).toBe(state === 0);
		expect(future.isResolved()).toBe(state === 1);
		expect(future.isRejected()).toBe(state === 2);
		expect(future.isCancelled()).toBe(state === 3);
	}
	
	function rejectedFuture(msg) {
		var result = new Future();
		result.fail(function (reason) { 
			// Prevent the rejection to be thrown.
		});
		result.reject(new Error(msg || ''));
		return result;
	}
	
	describe("Futures", function () { //////////////////////////////////////////
		it("state transitions", function () {	
			var future;
			expectState(future = new Future(), 0);
			expectState(future.resolve(), 1);
			expectState(future.reject(), 1);
			expectState(future.cancel(), 1);
			
			expectState(future = new Future(), 0);
			future.fail(function (reason) { // Prevent the rejection to be thrown.
				expect(reason).toBeUndefined();
			});
			expectState(future.reject(), 2);
			expectState(future.resolve(), 2);
			expectState(future.cancel(), 2);
			
			expectState(future = new Future(), 0);
			expectState(future.cancel(), 3);
			expectState(future.resolve(), 3);
			expectState(future.reject(), 3);
		});
	
		async_it("resolution", function () {
			var future = new Future(),
				resolution = Math.random(),	test;
			test = future.then(function done(value) {
				expect(value).toEqual(resolution);
			}, function fail(value) {
				throw new Error('onRejected called on resolved future.');
			});
			future.resolve(resolution);
			return test;
		});
	
		async_it("rejection", function () {
			var future = new Future(), 
				rejection = Math.random(), test;
			test = future.then(function done(value) {
				throw new Error('onResolved called on rejected future.');
			}, function fail(reason) {
				if (typeof reason !== 'number') { // If reason is not a number...
					throw error; // ... then is an error that must be raised.
				}
				expect(reason).toBe(rejection);
			});
			future.reject(rejection);
			return test;
		});
	
		async_it("cancellation", function () {
			var test = new Future(),
				result = new Future();
			test.done(function () {
				result.reject(new Error('Cancelled future should not call done callbacks.'));
			});
			test.fail(function () {
				result.reject(new Error('Cancelled future should not call fail callbacks.'));
			});
			test.__onCancel__(function () {
				result.resolve();
			});
			test.cancel();
			return result;
		});
		
		//TODO it "chaining".

		async_it("when()", function () {
			var future1 = Future.when(123); // One value.
			expect(future1).toBeOfType(Future);
			expectState(future1, 1);
			var future2 = new Future(); // One future.
			expect(Future.when(future2)).toBe(future2);
			var future3 = Future.when(); // No values.
			expect(future3).toBeOfType(Future);
			expectState(future3, 1);
			return future1.then(function (x) { // Check resolutions.
				expect(x).toBe(123);
			});
		});
	
		//TODO it "doWhile()"
		//TODO it "whileDo()"
		//TODO it "sequence()"
		
		var ALL_TEST_COUNT = 10;
		async_it("all() (all resolved first)", function () {
			return Future.sequence(base.Iterable.range(ALL_TEST_COUNT), function (n) { // All resolved first.
				var values = base.Iterable.range(n + 1).toArray(),
					futures = values.map(Future.when);
				return Future.all(futures).then(function (r) {
					expect(r).toEqual(values);
				});
			});
		});
		async_it("all() (some rejected first)", function () {
			return Future.sequence(base.Iterable.range(ALL_TEST_COUNT), function (n) {
				var values = base.Iterable.range(n + 1).toArray(),
					reject = Math.random() * (n + 1) >> 0,
					futures = values.map(function (v, i) {
						return i == reject || Math.random() < 1/n ? rejectedFuture('error@'+ n) : Future.when(v);
					});
				return Future.all(futures).then(function (r) {
					throw new Error("Future.all() with rejected elements should have been rejected.");
				}, function (e) {
					expect(e).toBeOfType(Error);
					expect(e.message).toEqual('error@'+ n);
				});
			});
		});
		async_it("all() (all resolved deferred)", function () {
			return Future.sequence(base.Iterable.range(ALL_TEST_COUNT), function (n) {
				var values = base.Iterable.range(n + 1).toArray(),
					futures = base.Iterable.range(n + 1).map(function (v, i) {
						return new Future();
					}).toArray();
				futures.forEach(function (f, i) { // Asynchronous deferred resolutions.
					setTimeout(f.resolve.bind(f, i), 10 + Math.random() * 10);
				});
				return Future.all(futures).then(function (r) {
					expect(r).toEqual(values);
				});
			});
		});
		async_it("all() (some rejected deferred)", function () {
			return Future.sequence(base.Iterable.range(ALL_TEST_COUNT), function (n) {
				var values = base.Iterable.range(n + 1).toArray(),
					reject = Math.random() * (n + 1) >> 0,
					futures = base.Iterable.range(n + 1).map(function (v, i) {
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
					throw new Error("Future.all() with rejected elements should have been rejected.");
				}, function (e) {
					expect(e).toBeOfType(Error);
					expect(e.message).toEqual('error@'+ n);
				});
			});
		});

		//TODO it "any()"
		
		async_it("delay()", function () {
			var timestamp = Date.now();
			return Future.delay(100).then(function (v) {
				var now = Date.now();
				expect(v).not.toBeLessThan(timestamp);
				expect(now).not.toBeLessThan(timestamp + 100);
			});
		});
	}); //// describe.
}); //// define.