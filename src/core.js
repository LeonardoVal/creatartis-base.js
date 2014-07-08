/** # Core

Generic algorithms and utility definitions.
*/

/** Depending on the execution environment the global scope may be different:
`window` in browsers, `global` under NodeJS, `self` in web workers, etc. 
`global` holds a reference to this object.
*/
var global = exports.global = (0, eval)('this');

/** `raise(message...)` builds a new instance of Error with the concatenation 
of the arguments as its message and throws it.
*/
var raise = exports.raise = function raise() {
	throw new Error(Array.prototype.slice.call(arguments, 0).join(''));
};

/** `raiseIf(condition, message...)` does the same as `raise` if `condition` is
true.
*/
var raiseIf = exports.raiseIf = function raiseIf(condition) {
	if (condition) {
		raise.apply(this, Array.prototype.slice.call(arguments, 1));
	}
};

/** Browsers and different environments have different ways to obtain the 
current call stack. `callStack(error=none)` unifies these. Returns an array with 
the callstack of error or (if missing) a new one is used, hence returning the 
current callStack.
*/
var callStack = exports.callStack = function callStack(exception) {
	if (exception) {
		return (exception.stack || exception.stacktrace || '').split('\n');
	} else try {
		throw new Error();
	} catch (e) {
		exception = e;
	}
	return (exception.stack || exception.stacktrace || '').split('\n').slice(1);
};

/** Javascript object literals (as of ES5) cannot be built with expressions as
keys. `obj(key, value...)` is an object constructor based on key-value pairs.
*/
var obj = exports.obj = function obj() {
	var result = ({});
	for (var i = 0; i < arguments.length; i += 2) {
		result[arguments[i] +''] = arguments[i+1];
	}
	return result;
};

/** `copy(objTo, objFrom...)` copies all own properties of the given objects 
into `objTo`, and returns it. If only one object is given, a copy of the `objTo`
object is returned.
*/
var copy = exports.copy = function copy(objTo) {
	var i = 1, k, objFrom;
	if (arguments.length < 2) {
		objTo = {};
		i = 0;
	}
	for (; i < arguments.length; i++) {
		objFrom = arguments[i];
		for (k in objFrom) {
			if (objFrom.hasOwnProperty(k) && !objTo.hasOwnProperty(k)) {
				objTo[k] = objFrom[k];
			}
		}
	}
	return objTo;
};