/** ## Initializer

Initializers are object builders, allowing the declaration of default values, type checks and
coercions, and other checks.
*/

var Initializer = exports.Initializer = declare({
	/** An initializer modifies a `subject` taking values from `args`. All by default are new empty
	objects.
	*/
	constructor: function Initializer(subject, args) {
		this.subject = subject || {};
		this.args = args || {};
	},

	/** `get(id, options)` gets the value for `id`. If it is missing, `options.defaultValue` is
	used as the default value if defined. Else an error is raised.

	If `options.type` is defined, the value is checked to be a member of said type. If 
	`options.coerce` is true, the value may be coerced to said type.	The `option.check` function
	can be defined to check the value further. It will be called with the value, and is expected to
	raise errors on failed conditions.

	Other options include:

	+ `options.regexp`: the value is matched agains a regular expression.

	+ `options.minimum`: the value has to be greater than or equal to this value.

	+ `options.maximum`: the value has to be less than or equal to this value.
	*/
	get: function get(id, options) {
		var value;
		options = options || {};
		if (!this.args.hasOwnProperty(id)) {
			raiseIf(!options.hasOwnProperty("defaultValue"), 
				options.missingValueError || "Missing argument `"+ id +"`!");
			value = options.defaultValue;
		} else {
			value = this.args[id];
		}
		if (options.typeCheck) {
			var coerced = options.typeCheck(value, !!options.coerce);
			raiseIf(typeof coerced === 'undefined', options.typeMismatchError ||
				"Incompatible value ("+ value +") for `"+ id +"`!");
			value = coerced;
		}
		raiseIf(options.regexp && !options.regexp.exec(value), options.invalidValueError || // Check further constraints.
			"Value ("+ value +") for `"+ id +"` does not match "+ options.regexp +"!");
		raiseIf(options.hasOwnProperty("minimum") && options.minimum > value, options.invalidValueError ||
			"Value ("+ value +") for `"+ id +"` must be greater than or equal to "+ options.minimum +"!");
		raiseIf(options.hasOwnProperty("maximum") && options.maximum < value, options.invalidValueError ||
			"Value ("+ value +") for `"+ id +"` must be less than or equal to "+ options.maximum +"!");
		if (typeof options.check === 'function') {
			options.check.call(this.subject, value, id, options);
		}
		return value;
	},

	/** `attr(id, options={})` assigns the `id` property, performing all necessary verifications.
	If the subject already has the attribute defined and `options.overwrite` is false, an error is
	raised. Any error is ignored and the assignment is skipped if `options.ignore` is true.
	*/
	attr: function attr(id, options) {
		options = options || {};
		try {
			raiseIf(options.hasOwnProperty("overwrite") && !options.overwrite && this.subject.hasOwnProperty(id),
				options.attrOverwriteError || "Attribute <"+ id +"> is already defined!");
			this.subject[id] = this.get(id, options);
		} catch (exception) {
			if (!options.ignore) {
				throw exception; // Do not ignore the error and throw it.
			}
		}
		return this; // For chaining.
	},

	/** ## Shortcuts ##############################################################################

	The following methods simplify the definitions of properties using `attr()`:
	*/

	/** + `bool(id, options)` assigns the `id` property with a truth value.
	*/
	bool: function bool(id, options) {
		options = options || {};
		options.typeCheck = function bool_typeCheck(value, coerce) {
			if (typeof value === 'boolean' || 
				value !== undefined && value !== null && value.constructor === Boolean) {
				return value;
			} else if (coerce) {
				return !!value;
			}
		};
		return this.attr(id, options);
	},

	/** + `string(id, options)` assigns the `id` property with a string.
	*/
	string: function string(id, options) {
		options = options || {};
		options.typeCheck = function string_typeCheck(value, coerce) {
			if (typeof value === 'string' || 
				value !== undefined && value !== null && value.constructor === String) {
				return value;
			} else if (coerce) {
				return ''+ value;
			}
		};
		return this.attr(id, options);
	},

	/** + `number(id, options)` assigns the `id` property with a numerical value.
	*/
	number: function number(id, options) {
		options = options || {};
		options.typeCheck = function number_typeCheck(value, coerce) {
			if (typeof value === 'number' || 
				value !== undefined && value !== null && value.constructor === Number) {
				return value;
			} else if (coerce) {
				return +value;
			}
		};
		return this.attr(id, options);
	},

	/** + `integer(id, options)` assigns the `id` property with an integer.
	*/
	integer: function integer(id, options) {
		options = options || {};
		options.typeCheck = function integer_typeCheck(value, coerce) {
			if (Math.floor(value) === value) {
				return value;
			} else if (coerce) {
				return Math.floor(+value);
			}
		};
		return this.attr(id, options);
	},

	/** + `func(id, options)` assigns the `id` property with a function.
	*/
	func: function func(id, options) {
		options = options || {};
		options.typeCheck = function func_typeCheck(value, coerce) {
			if (typeof value === 'function' || 
				value !== undefined && value !== null && value.constructor === Function) {
				return value;
			}
		};
		return this.attr(id, options);
	},

	/** + `array(id, options)` assigns the `id` property with an array.
	*/
	array: function array(id, options) {
		options = options || {};
		options.typeCheck = function array_typeCheck(value, coerce) {
			if (Array.isArray(value)) {
				//TODO Check length and element types.
				return value;
			}
		};
		return this.attr(id, options);
	},

	/** + `object(id, options)` assigns the `id` property with an object. Options may include:

		* `options.objectType`: object's class.
	*/
	object: function object(id, options) {
		options = options || {};
		options.typeCheck = function object_typeCheck(values, coerce) {
			if (typeof value === 'object' && (typeof options.objectType !== 'function' || 
				value instanceof options.objectType)) {
				return value;
			}
		};
		return this.attr(id, options);
	}
}); // declare Initializer.
