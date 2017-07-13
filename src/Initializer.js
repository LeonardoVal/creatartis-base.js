/** ## Initializer

Initializers are object builders, allowing the declaration of default values,
type checks and coercions, and other checks.
*/

var Initializer = exports.Initializer = declare({
	/** An initializer modifies a `subject` taking values from `args`. All by
	default are new empty objects.
	*/
	constructor: function Initializer(subject, args) {
		this.subject = subject || {};
		this.args = args || {};
	},

	/** `get(id, options)` gets the value for `id`. If it is missing,
	`options.defaultValue` is used as the default value if defined. Else an
	error is raised.

	If `options.type` is defined, the value is checked to be a member of said
	type. If `options.coerce` is true, the value may be coerced to said type.
	The `option.check` function can be defined to check the value further. It
	will be called with the value, and is expected to raise errors on failed
	conditions.

	Other options include:

	+ `options.regexp`: the value is matched agains a regular expression.

	+ `options.minimum`: the value has to be greater than or equal to this value.

	+ `options.maximum`: the value has to be less than or equal to this value.
	*/
	get: function get(id, options) {
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
		type = options.type; // Check type if defined.
		if (type && !type.isType(value)) {
			if (!options.coerce) {
				throw new Error(options.typeMismatchError || "Value for <"+ id +"> must be a "+ type +"!");
			}
			value = type.coerce(value);
		}
		if (options.regexp && !options.regexp.exec(value)) { // Check further constraints.
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
	},

	/** `attr(id, options={})` assigns the `id` property, performing all
	necessary verifications. If the subject already has the attribute defined
	and `options.overwrite` is false, an error is raised. Any error is ignored
	and the assignment is skipped if `options.ignore` is true.
	*/
	attr: function attr(id, options) {
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
	},

	/** ## Shortcuts ###########################################################

	The following methods simplify the definitions of properties using `attr()`:
	*/

	/** + `bool(id, options)` assigns the `id` property with a truth value.
	*/
	bool: function bool(id, options) {
		options = options || {};
		options.type = types.BOOLEAN;
		return this.attr(id, options);
	},

	/** + `string(id, options)` assigns the `id` property with a string.
	*/
	string: function string(id, options) {
		options = options || {};
		options.type = types.STRING;
		return this.attr(id, options);
	},

	/** + `number(id, options)` assigns the `id` property with a numerical value.
	*/
	number: function number(id, options) {
		options = options || {};
		options.type = types.NUMBER;
		return this.attr(id, options);
	},

	/** + `integer(id, options)` assigns the `id` property with an integer.
	*/
	integer: function integer(id, options) {
		options = options || {};
		options.type = types.INTEGER;
		return this.attr(id, options);
	},

	/** + `func(id, options)` assigns the `id` property with a function.
	*/
	func: function func(id, options) {
		options = options || {};
		options.type = types.FUNCTION;
		return this.attr(id, options);
	},

	/** + `array(id, options)` assigns the `id` property with an array. Options
	may include:
		* `options.elementTypes`: Required type of the array's elements.
		* `options.length`: Required length of the array.
	*/
	array: function array(id, options) {
		options = options || {};
		if (options.hasOwnProperty('length') || options.hasOwnProperty('elementType')) {
			options.type = new types.ArrayType(options.elementType, options.length);
		} else {
			options.type = types.ARRAY;
		}
		return this.attr(id, options);
	},

	/** + `object(id, options)` assigns the `id` property with an object.
	*/
	object: function object(id, options) {
		options = options || {};
		options.type = types.OBJECT;
		return this.attr(id, options);
	}
}); // declare Initializer.

/** `initialize(subject, args)` returns a new Initializer for the subject.
*/
var initialize = exports.initialize = function initialize(subject) {
	var args = {};
	Array.prototype.forEach.call(arguments, function (obj) {
		args = Object.assign(args, obj);
	});
	return new Initializer(subject, args);
};
