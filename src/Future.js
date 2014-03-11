﻿/* Future (aka Promise, Deferred, Eventual, etc) implementation to deal with 
	asynchronism and parallelism.
*/
var Future = exports.Future = declare({
	/** new Future():
		An implementation of [futures](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Future.html)
		(aka [deferreds](http://api.jquery.com/category/deferred-object/) or
		[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)), 
		a construction oriented to simplify the interaction between parallel 
		threads. A [future](http://en.wikipedia.org/wiki/Futures_and_promises) 
		represents a value that is being calculated asynchronously. Callbacks 
		are registered for when the value becomes available or an error raised.
	*/
	constructor: function Future(value) {
		/** Future.state=0:
			Current state of the Future. Pending is 0, resolved is 1, rejected
			is 2, cancelled is 3.
		*/
		this.state = 0;
		this.callbacks = [[],[],[]];
		if (arguments.length > 0) {
			this.resolve(value);
		}
	},

	/** Future.STATES=['pending', 'resolved', 'rejected', 'cancelled']:
		An array with labels for the Future's possible states.
	*/
	STATES: ['pending', 'resolved', 'rejected', 'cancelled'],
	
	/** Future.__complete__(context, value, state):
		Internal use method that changes this future's state from pending to 
		state, calling all the corresponding callbacks with the given context 
		and value.
	*/
	__complete__: function __complete__(context, value, state) {
		var future = this;
		if (this.state === 0) {
			this.state = state;
			this.__completion__ = [context, value];
			this.callbacks[state - 1].forEach(function (callback) {
				if (typeof callback === 'function') {
					setTimeout(callback.bind(context, value), 1);
				}
			});
		}
		return this; // for chaining.
	},

	/** Future.resolve(value, context=this):
		Marks the future as resolved. This method should be	called by the 
		producer thread when its process is finished successfully.
	*/
	resolve: function resolve(value, context) {
		return this.state === 0 ? this.__complete__(context || this, value, 1) : this;
	},

	/** Future.reject(reason, context=this):
		Marks the future as 'rejected' and calls onRejected callbacks. This 
		method should be called by the producer thread when its process is 
		aborted with an error.
		If there aren't any onRejected callbacks registered, an Error is raised.
		This can be reason (if it is already an Error) or a new Error with
		reason as message.
	*/
	reject: function reject(reason, context) {
		if (this.state === 0) {
			this.__complete__(context || this, reason, 2);
			if (this.callbacks[1].length < 1) {
				if (reason instanceof Error) {
					throw reason;
				} else {
					throw new Error(reason);
				}
			}
		}
		return this;
	},

	/** Future.cancel(reason):
		Marks the future as 'cancelled' and disregards all callbacks. This 
		method may be called by either the producer or the consumer threads.
	*/	
	cancel: function cancel(reason) {
		return this.state === 0 ? this.__complete__(this, reason, 3) : this;
	},

	/** Future.bind(future):
		Binds this future resolution, rejection and cancellation to the given 
		future's corresponding resolution, rejection and cancellation. 
	*/
	bind: function bind(future) {
		future.done(this.resolve.bind(this));
		future.fail(this.reject.bind(this));
		future.__onCancel__(this.cancel.bind(this));
		return this;
	},

	/** Future.__register__(callback, state):
		Registers a callbacks to be called when this Future is in the given 
		state. If this Future is already in that state the callback is called 
		right away. If this Future is neither pending nor in that state, the
		callback is ignored.
	*/
	__register__: function __register__(callback, state) {
		if (typeof callback === 'function') {
			if (this.state === 0) { // If future is pending...
				this.callbacks[state - 1].push(callback);
			} else if (this.state === state) {
				setTimeout(callback.bind(this.__completion__[0], this.__completion__[1]), 1);
			}
			return this;
		} else {
			throw new Error("Callback must be a function, and not "+ callback);
		}
	},

	/** Future.done(callback...):
		Registers one or more callbacks to be called when this Future is 
		resolved. If this Future is already resolved the callbacks are called
		right away. If this Future is neither pending nor resolved, callbacks
		are ignored.
	*/
	done: function done() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 1);
		}
		return this;
	},

	/** Future.fail(callback...):
		Registers one or more callbacks to be called when this Future is 
		rejected. If this Future is already rejected the callbacks are called
		right away. If this Future is neither pending nor rejected, callbacks
		are ignored.
	*/
	fail: function fail() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 2);
		}
		return this;
	},

	/** Future.__onCancel__(callback...):
		Registers one or more callbacks to be called when this Future is 
		cancelled.
	*/
	__onCancel__: function __onCancel__() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 3);
		}
		return this;
	},

	/** Future.always(callback...):
		Registers one or more callbacks to be called when this Future is either
		resolved or rejected. It is the same as using done() and fail() 
		functions.
	*/
	always: function always() {
		return this.done.apply(this, arguments).fail.apply(this, arguments);
	},

	/** Future.isPending():
		Checks if this future's state is 'pending'.
	*/
	isPending: function isPending() {
		return this.state === 0;
	},

	/** Future.isResolved:
		Checks if this future's state is 'resolved'.
	*/
	isResolved: function isResolved() {
		return this.state === 1;
	},

	/** Future.isRejected:
		Checks if this future's state is 'rejected'.
	*/
	isRejected: function isRejected() {
		return this.state === 2;
	},

	/** Future.isCancelled:
		Checks if this future's state is 'cancelled'.
	*/
	isCancelled: function isCancelled() {
		return this.state === 3;
	},

	/** Future.then(onResolved, onRejected):
		Returns a new Future which is resolved when this future is resolved, and
		rejected in the same way. The given callbacks are used to calculate a
		new value to either resolution or rejection of the new Future object.
	*/
	then: function then(onResolved, onRejected) {
		var result = new Future();
		this.done(function (value) {
			try {
				value = onResolved ? onResolved(value) : value;
				if (value instanceof Future) {
					result.bind(value);
				} else {
					result.resolve(value);
				}
			} catch (err) {
				result.reject(err);
			}			
		});
		this.fail(function (reason) {
			if (!onRejected) {
				result.reject(reason);
			} else {
				try {
					reason = onRejected(reason);
					if (reason instanceof Future) {
						result.bind(reason);
					} else {
						result.resolve(reason);
					}
				} catch (err) {
					result.reject(err);
				}
			}
		});
		this.__onCancel__(result.cancel.bind(result));
		return result;
	},
	
	toString: function toString() {
		return 'Future:'+ this.STATES[this.state];
	},
	
// Functions dealing with Futures. /////////////////////////////////////////////

	/** static Future.when(value):
		Unifies asynchronous and synchronous behaviours. If value is a Future
		it is returned as it is. Else a resolved Future is returned with the 
		given value.
	*/
	'static when': function when(value) {
		return value instanceof Future ? value : new Future(value);
	},

	/** static Future.invoke(fn, _this, args...):
		Calls the function synchronously, returning a future resolved with the 
		call's result. If an exceptions is raised, the future is rejected with it.
	*/
	'static invoke': function invoke(fn, _this) {
		try {
			return when(fn.apply(_this, Array.prototype.slice.call(arguments, 2)));
		} catch (error) {
			var result = new Future();
			result.reject(error);
			return result;
		}
	},

	/** static Future.all(futures):
		Returns a Future that is resolved when all the given futures are 
		resolved, or rejected when one is rejected. If no futures are given,
		the result is resolved with [].
	*/
	'static all': function all(futures) {
		futures = Array.isArray(futures) ? futures : iterable(futures).toArray();
		var result = new Future(),
			count = futures.length,
			values = new Array(count), future,
			doneCallback = function (index, value) {
				values[index] = value;
				if (--count < 1) {
					//console.log("all() resolved with "+ values.length +" values.");//FIXME
					result.resolve(values);
				}
			};
		if (count < 1) {
			result.resolve([]);
		} else for (var i = 0; i < futures.length; i++) {
			future = when(futures[i]);
			future.done(doneCallback.bind(this, i));
			future.fail(result.reject.bind(result));
			future.__onCancel__(result.cancel.bind(result));
		}
		return result;
	},

	/** static Future.any(futures):
		Returns a Future that is resolved when any of the given futures are 
		resolved, or rejected when all are rejected. If no futures are given,
		the result is rejected with undefined.
	*/
	'static any': function any(futures) {
		futures = iterables.iterable(futures).toArray();
		var result = new Future(), 
			count = futures.length,
			values = new Array(count), future;
		if (count < 1) {
			result.reject();
		} else for (var i = 0; i < futures.length; i++) {
			future = when(futures[i]);
			future.fail((function (index) {
				return function (value) {
					values[index] = value;
					count--;
					if (count < 1) {
						result.reject(value);
					}
				};
			})(i));
			future.done(result.resolve.bind(result));
			future.__onCancel__(result.cancel.bind(result));
		}
		return result;
	},

	/** static Future.sequence(xs, f=None):
		Evaluates all values and futures in the iterable xs in sequence. If it
		is given, the function f is called for each value.
	*/
	'static sequence': function sequence(xs, f) {
		var result = new Future(), x,
			rejection = result.reject.bind(result),
			it = iterable(xs).__iter__(),
			action = function action(lastValue) {
				try {
					x = it();
					if (f) {
						return when(x).then(f, rejection).then(action, rejection);
					} else {
						return when(x).then(action, rejection);
					}
				} catch (err) {
					if (err === STOP_ITERATION) {
						result.resolve(lastValue);
					} else {
						result.reject(err);
					}
				}
			};
		action();
		return result;
	},

	/** static Future.doWhile(action, condition):
		Perform the action until the condition fails. The action is first called
		without arguments, and afterwards is called with the previous value. The
		conditions is always called with the last value returned by action. 
		Both action and condition may return futures. The condition by default
		is the boolean conversion of the action's returned value.
	*/
	'static doWhile': function doWhile(action, condition) {
		condition = condition || function (value) {
			return !!value;
		};
		var loopEnd = new Future(),
			reject = loopEnd.reject.bind(loopEnd);
		function loop(value) {
			Future.invoke(condition, this, value).then(function (checks) {
				if (checks) {
					Future.invoke(action, this, value).then(loop, reject);
				} else {
					loopEnd.resolve(value);
				}
			}, reject);
		}
		Future.invoke(action).then(loop, reject);
		return loopEnd;
	},

	/** static Future.whileDo(condition, action):
		Similar to futures.doWhile, but evaluates the condition first.
	*/
	'static whileDo': function whileDo(condition, action) {
		return Future.invoke(condition).then(function (checks) {
			return Future.doWhile(action, condition);
		});
	},

	/** static Future.delay(ms, value):
		Return a future that will be resolved with the given value after the 
		given time in milliseconds. Time is forced to be at least 10ms. If value
		is undefined, the timestamp when the function is called is used.
	*/
	'static delay': function delay(ms, value) {
		ms = isNaN(ms) ? 10 : Math.max(+ms, 10);
		value = typeof value === 'undefined' ? Date.now() : value;
		var result = new Future();
		setTimeout(result.resolve.bind(result, value), ms);
		return result;
	},

	/** static Future.retrying(f, t=10, delay=100ms, delayFactor=2, maxDelay=5min):
		Calls the function f upto t times until it returns a value or a future that
		is resolved. Each time is separated by a delay that gets increased by
		delayFactor upto maxDelay.
	*/
	'static retrying': function retrying(f, times, delay, delayFactor, maxDelay) {
		times = isNaN(times) ? 10 : +times;
		return times < 1 ? Future.invoke(f) : Future.invoke(f).then(undefined, function () {
			delay = isNaN(delay) ? 100 : +delay;
			delayFactor = isNaN(delayFactor) ? 2.0 : +delayFactor;
			maxDelay = isNaN(maxDelay) ? 300000 : +maxDelay;
			return Future.delay(delay).then(function () {
				return Future.retrying(f, times - 1, Math.min(maxDelay, delay * delayFactor), delayFactor, maxDelay);
			});
		});
	},

	/** static Future.imports(...modules):
		Builds a future that loads the given modules using RequireJS' require 
		function, and resolves to an array of the loaded modules.
	*/
	'static imports': function imports() {
		var result = new Future();
		require(Array.prototype.slice.call(arguments), function () {
			result.resolve(Array.prototype.slice.call(arguments));
		}, function (err) {
			result.reject(err);
		});
		return result;
	}
}); // declare Future.

var when = Future.when;