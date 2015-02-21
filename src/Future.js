/** # Future 

An implementation of [futures](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Future.html),
also known as [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
or [deferreds](http://api.jquery.com/category/deferred-object/). These are constructions oriented to 
simplify the interaction between parallel threads. 

A [future](http://en.wikipedia.org/wiki/Futures_and_promises) represents a value that is being 
calculated asynchronously. Callbacks are registered for when the value becomes available or an error
raised.
*/
var Future = exports.Future = declare({
	/** The constructor builds a resolved future if a value is given, else it builds a pending 
	future.
	*/
	constructor: function Future(value) {
		this.state = 0;
		this.callbacks = [[],[],[]];
		if (arguments.length > 0) {
			this.resolve(value);
		}
	},

	/** The method `__future__` is used to get a future from an object. Many methods of `Future` 
	that deal with object that may or may not be futures use this to solve the ambiguity. In this 
	case it returns this object, but other objects may implement it in other ways.
	*/
	__future__: function __future__() {
		return this;
	},
	
	'static __isFuture__': function __isFuture__(obj) {
		return typeof obj !== 'undefined' && obj !== null && typeof obj.__future__ === 'function';
	},
	
	// ## State ####################################################################################
	
	/** A future may be in any of 4 states:
	
	+ 0 or `pending` means that the asynchronous process this future represents has not finished.
		
	+ 1 or `resolved` means that the asynchronous process this future represents has finished 
	successfully.
		
	+ 2 or `rejected` means that the asynchronous process this future represents has finished 
	unsuccessfully.
		
	+ 3 or `cancelled` means that the asynchronous process this future represents was aborted.
	*/
	STATES: ['pending', 'resolved', 'rejected', 'cancelled'],
	
	isPending: function isPending() {
		return this.state === 0;
	},

	isResolved: function isResolved() {
		return this.state === 1;
	},

	isRejected: function isRejected() {
		return this.state === 2;
	},

	isCancelled: function isCancelled() {
		return this.state === 3;
	},
	
	/** When a future is completed (either resolved or rejected) all the corresponding callbacks are
	called asynchronously with the given context and value.
	
	A future may not be completed more than once. Repeated calls to completion methods are ignored.
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

	/** `resolve(value, context=this)` completes the future as `resolved`. This method should be 
	called by the producer when its process is finished successfully.
	*/
	resolve: function resolve(value, context) {
		return this.state === 0 ? this.__complete__(context || this, value, 1) : this;
	},

	/** `reject(reason, context=this)` completes the future as `rejected`. This method should be 
	called by the producer thread when its process is aborted with an error.
	
	If there aren't any `onRejected` callbacks registered, an `Error` is raised. This can be 
	`reason` (if it is already an `Error` instance) or a new `Error` with `reason` as its message.
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

	/** `cancel(reason)` completes the future as `cancelled`, disregarding all callbacks. This 
	method may be called by either the producer or the consumer.
	*/	
	cancel: function cancel(reason) {
		return this.state === 0 ? this.__complete__(this, reason, 3) : this;
	},

	toString: function toString() {
		return 'Future:'+ this.STATES[this.state];
	},
	
	// ## Callbacks ################################################################################
	
	/** For a future to have some use, callback functions are registered to be called when it is 
	completed. Callbacks registered after the future's completion are called right away if the state 
	matches, or ignored otherwise.
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

	/** `done(callback...)` registers one or more callbacks to be called if this future gets 
	resolved.
	*/
	done: function done() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 1);
		}
		return this;
	},

	/** `fail(callback...)` registers one or more callbacks to be called if this future gets 
	rejected.
	*/
	fail: function fail() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 2);
		}
		return this;
	},

	/** `__onCancel__(callback...)` registers one or more callbacks to be called if this future gets
	cancelled. This is unusual, yet provided for testing purposes.
	*/
	__onCancel__: function __onCancel__() {
		for (var i = 0; i < arguments.length; i++) {
			this.__register__(arguments[i], 3);
		}
		return this;
	},

	/** `always(callback...)` registers one or more callbacks to be called if this future gets 
	either resolved or rejected.
	*/
	always: function always() {
		return this.done.apply(this, arguments).fail.apply(this, arguments);
	},

	/** Binding one future to another ties the completion of the second one to the completion of the
	first one.
	*/
	bind: function bind(future) {
		future.done(this.resolve.bind(this));
		future.fail(this.reject.bind(this));
		future.__onCancel__(this.cancel.bind(this));
		return this;
	},

	/** `then(onResolved, onRejected)` is probably the most used function of promises. It represents
	a kind of asynchronous sequence operation, returning a new future which is resolved when this 
	future is resolved, and rejected in the same way. 
	
	The given callbacks are used to calculate a new value to either resolution or rejection of the 
	new future object, and they themselves may be asynchronous returning futures.
	*/
	then: function then(onResolved, onRejected) {
		var result = new Future();
		this.done(function (value) {
			var futureValue;
			try {
				value = onResolved ? onResolved(value) : value;
				if (__isFuture__(value)) {
					result.bind(value.__future__());
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
					if (__isFuture__(reason)) {
						result.bind(reason.__future__());
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
	
	// ## Functions dealing with futures ###########################################################

	/** `when(value)` unifies asynchronous and synchronous behaviours. If `value` is a future it is
	returned as it is. Else a new future is returned resolved with the given value.
	*/
	'static when': function when(value) {
		return __isFuture__(value) ? value.__future__() : new Future(value);
	},

	/** The static version of `then(value, onResolved, onRejected)` is another way of unifying 
	asynchronous and synchronous behaviours. If `value` is a future, it behaves like the instance 
	`then()`. Else it calls `onResolved` with the given value. 
	
	The main difference with using `Future.when()` is that if value is not a future, the result may 
	not be a future neither. This may be useful for avoiding asynchronism overhead when synchronism 
	is more probable.
	*/
	'static then': function then(value, onResolved, onRejected) {
		return __isFuture__(value) ? value.__future__().then(onResolved, onRejected) : onResolved(value);
	},
	
	/** `invoke(fn, _this, args...)` calls the function synchronously, returning a future resolved 
	with the call's result. If an exceptions is raised, the future is rejected with it.
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

	/** `all(futures)` builds a future that is resolved if all the given futures get resolved, or 
	rejected if one gets rejected. If no futures are given, the result is resolved with [].
	*/
	'static all': function all(futures) {
		futures = Array.isArray(futures) ? futures : iterable(futures).toArray();
		var result = new Future(),
			count = futures.length,
			values = new Array(count), future,
			doneCallback = function (index, value) {
				values[index] = value;
				if (--count < 1) {
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

	/** `any(futures)` builds a future that is resolved if any of the given futures are resolved, or
	rejected if all are rejected. If no futures are given, the result is rejected with undefined.
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

	/** `sequence(xs, f=None)` evaluates all values and futures in the iterable `xs` in sequence. If
	defined, the function f is called for each value.
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

	/** `doWhile(action, condition)` performs the action until the condition fails. The action is 
	first called without arguments, and afterwards it is called with the previous value. The 
	condition is always called with the last value returned by action.
		
	Both action and condition may return futures. The condition by default is the boolean conversion
	of the action's returned value.
	*/
	'static doWhile': function doWhile(action, condition) {
		condition = condition || function (value) {
			return !!value;
		};
		var loopEnd = new Future(),
			reject = loopEnd.reject.bind(loopEnd);
		function loop(value) {
			Future.invoke(condition, null, value).then(function (checks) {
				if (checks) {
					Future.invoke(action, null, value).then(loop, reject);
				} else {
					loopEnd.resolve(value);
				}
			}, reject);
		}
		Future.invoke(action).then(loop, reject);
		return loopEnd;
	},

	/** `whileDo(condition, action)` is similar to `doWhile`, but evaluates the condition first with
	no arguments.
	*/
	'static whileDo': function whileDo(condition, action) {
		return Future.invoke(condition).then(function (checks) {
			return Future.doWhile(action, condition);
		});
	},

	/** `delay(ms, value)` return a future that will be resolved with the given value after the 
	given time in milliseconds. Time is forced to be at least 10ms. If value is undefined, the 
	timestamp when the function is called is used.
	*/
	'static delay': function delay(ms, value) {
		ms = isNaN(ms) ? 10 : Math.max(+ms, 10);
		value = typeof value === 'undefined' ? Date.now() : value;
		var result = new Future();
		setTimeout(result.resolve.bind(result, value), ms);
		return result;
	},

	/** `retrying(f, t=10, delay=100ms, delayFactor=2, maxDelay=5min)` calls the function `f` upto 
	`t` times until it returns a value or a future that is resolved. Each time is separated by a 
	`delay` that gets increased by `delayFactor` upto `maxDelay`.
	
	This function is meant to simplify the implementation of retry schemes, e.g. AJAX calls.
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

	/** `imports(...modules)` returns a future that loads the given modules using 
	[RequireJS'](http://requirejs.org/) `require` function, and resolves to an array of the loaded 
	modules.
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

var when = Future.when,
	__isFuture__ = Future.__isFuture__;