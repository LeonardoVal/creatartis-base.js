/** # Objects
	
OOP related functions and definitions.
*/
var objects = exports.objects = (function () {
	/** Extending a constructor implies assigning as the subconstructor 
	prototype an instance of the parent constructor. If no constructor is given,
	a new one is used.
	*/
	var subconstructor = this.subconstructor = function subconstructor(parent, constructor) {
		var proto, placeholder;
		if (typeof constructor !== 'function') { // If no constructor is given ...
			constructor = (function () { // ... provide a default constructor.
				parent.apply(this, arguments);
			});
		}
		/** This is similar to the way 
		[goog.inherits does it in Google's Closure Library](http://docs.closure-library.googlecode.com/git/namespace_goog.html). 
		It is preferred since it does not require the parent constructor to 
		support being called without arguments.			
		*/
		placeholder = function () {};
		placeholder.prototype = parent.prototype;
		constructor.prototype = new placeholder();
		constructor.prototype.constructor = constructor;
		return constructor;
	};
	
	/** `objects.addMember(constructor, key, value, force=false)` adds `value`
	as a member of the constructor's prototype. If it already has a member with 
	the `key`, it is overriden only if `force` is true.
	*/
	var addMember = this.addMember = function addMember(constructor, key, value, force) {
		var modifiers = key.split(/\s+/),
			key = modifiers.pop(),
			scope = constructor.prototype;
		if (modifiers.indexOf('static') >= 0) {
			scope = constructor;
		}
		if (force || typeof scope[key] === 'undefined') {
			if (modifiers.indexOf('property') >= 0) {
				return Object.defineProperty(scope, key, value);
			} else {
				return scope[key] = value;
			}
		}
	};
	
	/** `objects.addMembers(constructor, members, force=false)` adds all own 
	properties of members to the constructor's prototype, using 
	`objects.addMember`.
	*/
	var addMembers = this.addMembers = function addMembers(constructor, members, force) {
		Object.keys(members).map(function (id) {
			addMember(constructor, id, members[id], force);
		});
	};
	
	/** The function `objects.declare(supers..., members={})` implements basis'
	object oriented implementation, influenced by 
	[Dojo's](http://dojotoolkit.org/reference-guide/1.9/dojo/_base/declare.html). 
	The first super is considered the parent. The following supers add to the
	returned constructor's prototype, but do not override. The given members 
	always override.
	*/
	var declare = exports.declare = this.declare = function declare() {
		var args = Array.prototype.slice.call(arguments),
			parent = args.length > 1 ? args.shift() : Object,
			members = args.length > 0 ? args.pop() : {},
			constructor = subconstructor(parent, members.hasOwnProperty('constructor') ? members.constructor : undefined), //WARN ({}).constructor == Object.
			initializer = members[''];
		Object.keys(members).map(function (id) {
			if (id !== '' && id !== 'constructor') {
				addMember(constructor, id, members[id], true);
			}
		});
		args.forEach(function (members) {
			if (typeof members === 'function') {
				members = members.prototype;
			}
			addMembers(constructor, members, false);
		});
		if (typeof initializer === 'function') {
			initializer.apply(constructor);
		}
		return constructor;
	};

	/** Abstract methods can be quickly defined with 
	`objects.unimplemented(cls, id)`. It returns a function that raises an 
	"unimplemented method" exception. This is recommended, for better debugging.
	*/
	var unimplemented = this.unimplemented = function unimplemented(cls, id) {
		return function () {
			throw new Error((this.constructor.name || cls) +"."+ id +"() not implemented! Please override.");
		};
	};
	
	return this;
}).call({}); //// objects.

// `objects.declare` is also available through `basis.declare`.
var declare = objects.declare;