/** basis/typed.js:
	Functions and definitions regarding type checking, constraints,	validation 
	and coercion.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Type representations. ///////////////////////////////////////////////////////
var types = exports.types = {};

var Type = exports.Type = function Type(defs) {
	defs = defs || {};
	if (defs.hasOwnProperty('isType') && typeof defs.isType === 'function') {
		this.isType = defs.isType;
	}
	if (defs.hasOwnProperty('isCompatible') && typeof defs.isCompatible === 'function') {
		this.isCompatible = defs.isCompatible;
	}
	if (defs.hasOwnProperty('coerce') && typeof defs.coerce === 'function') {
		this.coerce = defs.coerce;
	}
	if (defs.hasOwnProperty('toString') && typeof defs.toString === 'string') {
		var typeString = defs.toString;
		this.toString = function toString() {
			return typeString;
		};
	}
};

/** Type.isCompatible(value):
	Returns if the value is assignment compatible with this type. By default
	the only compatible values are the ones in the type itself. But it can
	be overriden to allow subtypes and coercions.
*/
Type.prototype.isCompatible = function isCompatible(value) {
	return this.isType(value);
};

/** Type.incompatibleError(value):
	Returns an Error with a message for values incompatible with this type.
*/
Type.prototype.incompatibleError = function incompatibleError(value) {
	return new TypeError("Value "+ value +" is not compatible with type "+ this +".");
};

/** Type.coerce(value):
	Converts the value to this type, if possible and necessary. If it is not
	possible, it raises a TypeError. This is the default behaviour.
*/
Type.prototype.coerce = function coerce(value) {
	throw this.incompatibleError(value);
};

// Javascript primitive types. /////////////////////////////////////////////

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

types.FUNCTION = new Type({
	isType: function isType(value) {
		return typeof value === 'function' || 
			value !== undefined && value !== null && value.constructor === Function;
	},
	toString: "function"
});

// Simple types. ///////////////////////////////////////////////////////////

types.INTEGER = new Type({
	isType: function isType(value) {
		return (value << 0) === value;
	},
	isCompatible: function isCompatible(value) {
		return !isNaN(value);
	},
	coerce: function coerce(value) {
		return +value >> 0;
	},
	toString: "integer"
});

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

// Object types. ///////////////////////////////////////////////////////////

/** types.OBJECT:
	Basic Object type (no constructor or member constraints).
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

/** new types.ObjectType(defs):
	An object type is defined by a constructor function and/or a set of
	members, each defined by an id and a type.
*/
var ObjectType = types.ObjectType = function ObjectType(defs) {
	Type.call(this, {});
	if (defs.hasOwnProperty("constructor") && typeof def.constructor === 'function') {
		this.instanceOf = defs.constructor;
		delete defs.constructor;
	} else {
		this.instanceOf = null;
	}
	this.members = defs.members || {};
};
ObjectType.prototype = new Type();
ObjectType.prototype.constructor = ObjectType;

/** ObjectType.isType(value):
	Checks if the value is an object, and an instance of the specified
	constructor of this type (if applies).
*/
ObjectType.prototype.isType = function isType(value) {
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
};

/** ObjectType.isCompatible(value):
	Returns if the value is assignment compatible with this type. By default
	the only compatible values are the ones in the type itself. But it can
	be overriden to allow subtypes and coercions.
*/
ObjectType.prototype.isCompatible = function isCompatible(value) {
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
};

/** ObjectType.coerce(value):
	Converts the value to this type, if possible and necessary. If it is not
	possible, it raises a TypeError. This is the default behaviour.
*/
ObjectType.prototype.coerce = function coerce(value) { 
	var result = this.instanceOf ? new this.instanceOf(value) : {}; //TODO Check this please.
	for (var member in this.members) {
		result[member] = this.members[member].coerce(value[member]);
	}
	return result;
};

// Array types. ////////////////////////////////////////////////////////////

/** types.ARRAY:
	Basic array type (no length or element type constraints).
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

/** new types.ArrayType(elementTypes, length):
	Type for arrays of a given length and all elements of the given type.
*/
var ArrayType = types.ArrayType = function ArrayType(elementTypes, length) {
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
};
ArrayType.prototype = new Type();
ArrayType.prototype.constructor = ArrayType;

ArrayType.prototype.isType = function isType(value) {
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
};

ArrayType.prototype.isCompatible = function isCompatible(value) {
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
};

ArrayType.prototype.coerce = function coerce(value) {
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
};

// Initializers. ///////////////////////////////////////////////////////////////

/** new Initializer(subject={}, args={}):
	Initializers are object builders, allowing the declaration of default 
	values, type checks and coercions, and other checks.
*/		
var Initializer = exports.Initializer = function Initializer(subject, args) {
	this.subject = subject || {};
	this.args = args || {};
};

/** Initializer.get(id, options):
	Gets the value for the given id. If it is missing, options.defaultValue
	is used as the default value if defined. Else an error is raised.
	If options.type is defined, the value is checked to be a member of said
	type. If options.coerce is true, the value may be coerced.
	The function option.check can check the value further. If defined it
	is called with the value, and is expected to raise errors on failed
	conditions.
	Other options include:
	- options.regexp: the value is matched agains a regular expression.
	- options.minimum: the value has to be greater than or equal to this value.
	- options.maximum: the value has to be less than or equal to this value.
*/
Initializer.prototype.get = function get(id, options) {
	var value, type;
	options = options || {};
	if (!this.args.hasOwnProperty(id)) {
		if (!options.hasOwnProperty("defaultValue")) {
			throw new Error(options.missingValueError || "Missing argument <"+ id +">!");
		}
		value = options.defaultValue;
	} else {
		value = this.args[id];
	}
	// Check type if defined.
	type = options.type;
	if (type && !type.isType(value)) {
		if (!options.coerce) {
			throw new Error(options.typeMismatchError || "Value for <"+ id +"> must be a "+ type +"!");
		}
		value = type.coerce(value);
	}
	// Check further constraints.
	if (options.regexp && !options.regexp.exec(value)) {
		throw new Error(options.invalidValueError || "Value <"+ value +"> for <"+ id +"> does not match "+ options.regexp +"!");
	}
	if (options.hasOwnProperty("minimum") && options.minimum > value) {
		throw new Error(options.invalidValueError || "Value <"+ value +"> for <"+ id +"> must be greater than or equal to "+ options.minimum +"!");
	}
	if (options.hasOwnProperty("maximum") && options.maximum < value) {
		throw new Error(options.invalidValueError || "Value <"+ value +"> for <"+ id +"> must be less than or equal to "+ options.maximum +"!");
	}
	if (typeof options.check === 'function') {
		options.check.call(this.subject, value, id, options);
	}
	return value;
};

/** Initializer.attr(id, options={}):
	Assigns the id property, performing all necessary verifications. If 
	options.overwrite is false, an error is raised if the subject already 
	has the attribute defined. If options.ignore is true, no error is raised
	and the assignment is skipped instead. 
*/
Initializer.prototype.attr = function attr(id, options) {
	options = options || {};
	try {
		if (options.hasOwnProperty("overwrite") && !options.overwrite && this.subject.hasOwnProperty(id)) {
			throw new Error(options.attrOverwriteError || "Attribute <"+ id +"> is already defined!");
		}
		this.subject[id] = this.get(id, options);
	} catch (exception) { 
		if (!options.ignore) {
			throw exception; // Do not ignore the error and throw it.
		}
	}
	return this; // For chaining.
};

// Shortcuts. //////////////////////////////////////////////////////////////

/** Initializer.bool(id, options):
	Assigns the id property with a truth value.
*/
Initializer.prototype.bool = function bool(id, options) {
	options = options || {};
	options.type = types.BOOLEAN;
	return this.attr(id, options);
};

/** Initializer.string(id, options):
	Assigns the id property with a string value.
*/
Initializer.prototype.string = function string(id, options) {
	options = options || {};
	options.type = types.STRING;
	return this.attr(id, options);
};

/** Initializer.number(id, options):
	Assigns the id property with a numerical value.
*/
Initializer.prototype.number = function number(id, options) {
	options = options || {};
	options.type = types.NUMBER;
	return this.attr(id, options);
};

/** Initializer.integer(id, options):
	Assigns the id property with an integer value.
*/
Initializer.prototype.integer = function integer(id, options) {
	options = options || {};
	options.type = types.INTEGER;
	return this.attr(id, options);
};

/** Initializer.func(id, options):
	Assigns the id property with a function.
*/
Initializer.prototype.func = function func(id, options) {
	options = options || {};
	options.type = types.FUNCTION;
	return this.attr(id, options);
};

/** Initializer.array(id, options):
	Assigns the id property with an array. Options may include:
	- options.elementTypes: Required type of the array's elements.
	- options.length: Required length of the array.
*/
Initializer.prototype.array = function array(id, options) {
	options = options || {};
	if (options.hasOwnProperty('length') || options.hasOwnProperty('elementType')) {
		options.type = new types.ArrayType(options.elementType, options.length);
	} else {
		options.type = types.ARRAY;
	}
	return this.attr(id, options);
};

/** Initializer.object(id, options):
	Assigns the id property with an object.
*/
Initializer.prototype.object = function object(id, options) {
	options = options || {};
	options.type = types.OBJECT;
	return this.attr(id, options);
};

/** initialize(subject, args):
	Returns a new Initializer for the subject.
*/
exports.initialize = function initialize(subject, args) {
	return new Initializer(subject, args);
}
