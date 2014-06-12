/** # Typed

Functions and definitions regarding type checking, constraints,	validation and 
coercion.
*/

// ## Type representations #####################################################

/** `Type` is a representation of a datatype. It has three main methods:
*/
var Type = exports.Type = declare({
	constructor: function Type(defs) {
		defs = defs || {};
		if (typeof defs.isType === 'function') {
			this.isType = defs.isType;
		}
		if (typeof defs.isCompatible === 'function') {
			this.isCompatible = defs.isCompatible;
		}
		if (typeof defs.coerce === 'function') {
			this.coerce = defs.coerce;
		}
		if (typeof defs.toString === 'string') {
			var typeString = defs.toString;
			this.toString = function toString() {
				return typeString;
			};
		}
	},

	/** `isType(value)` decides whether `value` is a member of this type or not.
	This must be overriden, since the default implementation always returns 
	false.
	*/
	isType: function isType(value) {
		return false;
	},
	
	/** `isCompatible(value)` decides whether `value` is assignment compatible 
	or not with this type. By default the only compatible values are the ones in
	the type itself. But it can be overriden to allow subtypes and coercions.
	*/
	isCompatible: function isCompatible(value) {
		return this.isType(value);
	},

	/** `coerce(value)` converts `value` to this type, if possible and 
	necessary. If it is not possible, it raises a `TypeError`. This is the 
	default behaviour.
	*/
	coerce: function coerce(value) {
		throw this.incompatibleError(value);
	},
	
	/** `incompatibleError(value)` builds an Error with a message for values 
	incompatible with this type.
	*/
	incompatibleError: function incompatibleError(value) {
		return new TypeError("Value "+ value +" is not compatible with type "+ this +".");
	}
});

var types = exports.types = {};

// ### Javascript primitive types ##############################################

/** `types.BOOLEAN` represents the Javascript boolean type. Everything is 
compatible with it and the standard conversion is used (`!!value`). 
*/
types.BOOLEAN = new Type({
	isType: function isType(value) {
		return typeof value === 'boolean' || 
			value !== undefined && value !== null && value.constructor === Boolean;
	},
	isCompatible: function isCompatible(value) {
		return true; // Can always coerce to boolean.
	},
	coerce: function coerce(value) {
		return !!value;
	},
	toString: "boolean"
});

/** `types.NUMBER` represents the Javascript number type. Everything is 
compatible with it and the standard conversion is used (`+value`).
*/
types.NUMBER = new Type({
	isType: function isType(value) {
		return typeof value === 'number' || 
			value !== undefined && value !== null && value.constructor === Number;
	},
	isCompatible: function isCompatible(value) {
		return true; // Can always coerce to number.
	},
	coerce: function coerce(value) {
		return +value;
	},
	toString: "number"
});

/** `types.STRING` represents the Javascript string type. Everything is 
compatible with it and the standard conversion is used (`'' + value`).
*/
types.STRING = new Type({
	isType: function isType(value) {
		return typeof value === 'string' || 
			value !== undefined && value !== null && value.constructor === String;
	},
	isCompatible: function isCompatible(value) {
		return true; // Can always coerce to string.
	},
	coerce: function coerce(value) {
		return ''+ value;
	},
	toString: "string"
});

/** `types.FUNCTION` represents the Javascript function type. Only functions are 
compatible with it and there is no conversion.
*/
types.FUNCTION = new Type({
	isType: function isType(value) {
		return typeof value === 'function' || 
			value !== undefined && value !== null && value.constructor === Function;
	},
	toString: "function"
});

// ### Simple types ############################################################

/** `types.INTEGER` represents an integer numerical type. All numbers are
compatible with it, and the conversion truncates the value (`+value | 0`).
*/
types.INTEGER = new Type({
	isType: function isType(value) {
		return (value | 0) === value;
	},
	isCompatible: function isCompatible(value) {
		return !isNaN(value);
	},
	coerce: function coerce(value) {
		return +value | 0;
	},
	toString: "integer"
});

/** `types.CHARACTER` represents a character type. All values that convert to a
non empty string are compatible with it. The conversion takes the first caracter
of the string conversion.
*/
types.CHARACTER = new Type({
	isType: function isType(value) {
		return types.STRING.isType(value) && value.length === 1;
	},
	isCompatible: function isCompatible(value) {
		return (''+ value).length > 0;
	},
	coerce: function coerce(value) {
		return (''+ value).charAt(0);
	},
	toString: "character"
});

// ### Object types ############################################################

/** `types.OBJECT` is a basic object type (no constructor or member 
constraints). Only functions are incompatible with it, and the conversion simply
calls `Object(value)`.
*/
types.OBJECT = new Type({
	isType: function isType(value) {
		return typeof value === 'object';
	},
	isCompatible: function isCompatible(value) {
		return typeof value !== 'function';
	},
	coerce: function coerce(value) {
		switch (typeof value) {
			case 'function': throw this.incompatibleError(value);
			case 'object': return value;
			default: return Object(value);
		}
	},
	toString: "object"
});

/** `types.ObjectType(defs)` defines an object type with a constructor function 
and/or a set of members, each defined by an id and a type.
*/
var ObjectType = types.ObjectType = declare(Type, {
	constructor: function ObjectType(defs) {
		Type.call(this, {});
		if (defs.hasOwnProperty("constructor") && typeof def.constructor === 'function') {
			this.instanceOf = defs.constructor;
			delete defs.constructor;
		} else {
			this.instanceOf = null;
		}
		this.members = defs.members || {};
	},
	
	/** A value is a member of an `ObjectType` if it is an object, an instance 
	of the specified constructor for this type (if applies), and if it has the
	specified members for this type (if any).
	*/
	isType: function isType(value) {
		if (typeof value !== 'object') {
			return false;
		}
		if (this.instanceOf && !(value instanceof this.instanceOf)) {
			return false;
		}
		for (var member in this.members) {
			if (!this.members[member].isType(value[member])) {
				return false;
			}
		}
		return true;
	},

	/** A value is compatible of an `ObjectType` if it is an object of the 
	specified constructor (if any), and if it has members compatible with the 
	ones in the type (if specified). This may be overriden to allow subtypes and 
	coercions.
	*/
	isCompatible: function isCompatible(value) {
		if (typeof value !== 'object') {
			return false;
		}
		if (this.instanceOf && !(value instanceof this.instanceOf)) {
			return false;
		}
		for (var member in this.members) {
			if (!this.members[member].isCompatible(value[member])) {
				return false;
			}
		}
		return true;
	},

	/** A value is coerced to an `ObjectType` by calling the type's constructor
	with the value and adding conversions of the type's members.
	*/
	coerce: function coerce(value) { 
		var result = this.instanceOf ? new this.instanceOf(value) : {};
		for (var member in this.members) {
			result[member] = this.members[member].coerce(value[member]);
		}
		return result;
	}	
}); // declare ObjectType

// ### Array types #############################################################

/** `types.ARRAY` represents a basic array type (no length or element type 
constraints).
*/
types.ARRAY = new Type({
	isType: function isType(value) {
		return Array.isArray(value);
	},
	isCompatible: function isCompatible(value) {
		return this.isType(value) || typeof value === 'string';
	},
	coerce: function coerce(value) {
		if (this.isType(value)) {
			return value;
		} else if (typeof value === 'string') {
			return value.split('');
		} else {
			throw this.incompatibleError(value);
		}
	},
	toString: "array"
});

/** `types.ArrayType(elementTypes, length)` defines a type for arrays of a given 
length and all elements of the given type.
*/
var ArrayType = types.ArrayType = declare({
	constructor: function ArrayType(elementTypes, length) {
		Type.call(this, {});
		if (!elementTypes) {
			this.elementTypes = [];
			this.length = +length;
		} else if (!Array.isArray(elementTypes)) {
			this.elementTypes = [elementTypes];
			this.length = +length;
		} else {
			this.elementTypes = elementTypes;
			this.length = isNaN(length) ? this.elementTypes.length : Math.max(+length, this.elementTypes.length);
		}
	},

	isType: function isType(value) {
		if (!Array.isArray(value) || !isNaN(this.length) && value.length !== this.length) {
			return false;
		}
		if (this.elementTypes) {
			var elementType; 
			for (var i = 0, len = value.length; i < len; i++) {
				elementType = this.elementTypes[Math.min(this.elementTypes.length - 1, i)]; 
				if (!elementType.isType(value[i])) {
					return false;
				}
			}
		}
		return true;
	},

	isCompatible: function isCompatible(value) {
		if (!Array.isArray(value)) {
			if (typeof value === 'string') {
				value = value.split('');
			} else {
				return false;
			}
		}
		if (!isNaN(this.length) || value.length < +this.length) {
			return false;
		}
		if (this.elementTypes) {
			var elementType;
			for (var i = 0, len = value.length; i < len; i++) {
				elementType = this.elementTypes[Math.min(this.elementTypes.length - 1, i)]; 
				if (!elementType.isCompatible(value[i])) {
					return false;
				}
			}
		}
		return true;
	},

	coerce: function coerce(value) {
		if (!Array.isArray(value)) {
			if (typeof value === 'string') {
				value = value.split('');
			} else {
				throw this.incompatibleError(value);
			}
		} else {
			value = value.slice(); // Make a shallow copy.
		}
		if (!isNaN(this.length)) { 
			if (value.length > this.length) { // Longer arrays are truncated.
				value = value.slice(0, this.length);
			} else if (value.length < this.length) { // Shorter arrays cannot be coerced.
				throw this.incompatibleError(value);
			}
		}
		if (this.elementTypes) {
			var elementType; 
			for (var i = 0, len = value.length; i < len; i++) {
				elementType = this.elementTypes[Math.min(this.elementTypes.length - 1, i)]; 
				value[i] = elementType.coerce(value[i]);
			}
		}
		return value;
	}
}); // declare ArrayType
