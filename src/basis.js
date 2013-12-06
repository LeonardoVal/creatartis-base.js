/** basis/src/basis.js:
	Core generic algorithms and utility definitions.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Objects and object orientation. /////////////////////////////////////////////

/** declare(supers..., members={}):
	Object oriented implementations, influenced by Dojo's. The first super 
	is considered the parent. The following supers add to the returned 
	constructor's prototype, but do not override. The given members always
	override.
	See <http://dojotoolkit.org/reference-guide/1.9/dojo/_base/declare.html>.
*/
var declare = exports.declare = function declare() {
	var args = Array.prototype.slice.call(arguments),
		parent = args.length > 1 ? args.shift() : Object,
		members = args.length > 0 ? args.pop() : {},
		constructor = members.hasOwnProperty('constructor') ? members.constructor : undefined, //WARN ({}).constructor == Object.
		placeholder, proto;
	if (typeof constructor !== 'function') { // If no constructor is given ...
		constructor = (function () { // ... provide a default constructor.
			parent.apply(this, arguments);
		});
	}
	/* This is the way goog.inherits does it in Google's Closure Library. It
		is preferred since it does not require the parent constructor to 
		support being called without arguments.			
	*/
	placeholder = function () {};
	placeholder.prototype = parent.prototype;
	proto = constructor.prototype = new placeholder();
	for (var id in members) { // Copy members to the new prototype.
		if (members.hasOwnProperty(id)) {
			proto[id] = members[id];
		}
	} 
	proto.constructor = constructor;
	args.forEach(function (superMembers) { // Copy other members in the other supers, if they do not override.
		superMembers = typeof superMembers === 'function' ? superMembers.prototype : superMembers;
		for (id in superMembers) {
			if (typeof proto[id] === 'undefined') {
				proto[id] = superMembers[id];
			}
		}
	});
	return constructor;
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

/** Global:
	Global scope of the current execution environment. Usually (window) in 
	browsers and (global) under NodeJS.
*/
var Global = exports.Global = (0, eval)('this');

// Errors //////////////////////////////////////////////////////////////////////

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
		basis.raise(Array.prototype.slice.call(arguments, 1).join(''));
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