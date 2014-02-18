/* Core generic algorithms and utility definitions.
*/

/** Global:
	Global scope of the current execution environment. Usually (window) in 
	browsers and (global) under NodeJS.
*/
var Global = exports.Global = (0, eval)('this');

/** raise(message...):
	Builds a new instance of Error with the concatenation of the arguments 
	as its message and throws it.
*/
var raise = exports.raise = function raise() {
	throw new Error(Array.prototype.slice.call(arguments, 0).join(''));
};

/** raiseIf(condition, message...):
	If the condition is true a new Error is built and risen like in 
	basis.raise().
*/
var raiseIf = exports.raiseIf = function raiseIf(condition) {
	if (condition) {
		raise.call(this, Array.prototype.slice.call(arguments, 1));
	}
};

/** callStack(error=none):
	Returns an array with the callstack of error or (if missing) a new one 
	is used, hence returning the current callStack.
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

/** obj(key, value...):
	Object constructor based on key-value pairs. Useful to build objects 
	when keys come from expressions instead of identifiers or numerals, 
	which makes it impossible to use the object literal notation.
*/
var obj = exports.obj = function obj() {
	var result = ({});
	for (var i = 0; i < arguments.length; i += 2) {
		result[arguments[i] +''] = arguments[i+1];
	}
	return result;
};

/** copy(objTo, objFrom...):
	Copies all own properties of the given objects into objTo, and returns
	it. If only one object is given, a copy of the objTo object is returned.
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