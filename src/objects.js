/** objects:
	Bundle of OOP related functions and definitions.
*/
var objects = exports.objects = (function () {
	/** objects.subconstructor(parent, constructor=<new constructor>):
		Returns a new constructor (or the given constructor) with an adjusted
		prototype inheriting from the parent.
	*/
	var subconstructor = this.subconstructor = function subconstructor(parent, constructor) {
		var proto, placeholder;
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
		constructor.prototype = new placeholder();
		constructor.prototype.constructor = constructor;
		return constructor;
	};
	
	/** objects.addMember(constructor, key, value, force=false):
		Adds the value as a member of the constructor's type. If the constructor
		already has a member with the given key, it is overriden only if force
		is true.
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
	
	/** objects.addMembers(constructor, members, force=false):
		Adds all own properties of members to the constructor's type, using
		addMember.
	*/
	var addMembers = this.addMembers = function addMembers(constructor, members, force) {
		Object.keys(members).map(function (id) {
			addMember(constructor, id, members[id], force);
		});
	};
	
	/** objects.declare(supers..., members={}):
		Object oriented implementations, influenced by Dojo's. The first super 
		is considered the parent. The following supers add to the returned 
		constructor's prototype, but do not override. The given members always
		override.
		See [Dojo's declare](http://dojotoolkit.org/reference-guide/1.9/dojo/_base/declare.html).
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

	/** objects.unimplemented(cls, id):
		Returns a function that raises an "unimplemented method" exception.
	*/
	var unimplemented = this.unimplemented = function unimplemented(cls, id) {
		return function () {
			throw new Error((this.constructor.name || cls) +"."+ id +"() not implemented! Please override.");
		};
	};
	
	return this;
}).call({}); // Objects.

var declare = objects.declare;