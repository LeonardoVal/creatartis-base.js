/** # Serialization

Global registry of classes (constructors) and their methods to serialize and materialize 
(i.e. deserialize) instances of them.
*/
var Serialization = exports.Serialization = declare(Object, {
	/** The global registry of serialization methods is a static non-configurable property of 
	`Serializable`.
	*/
	"static property __registry__": {
		value: {},
		configurable: false
	},

	/** An instance of `Serialization` is an object that deals with both serialization and 
	materialization of a given class (or constructor). The serialization of each class is a 
	singleton, automatically registered in the global registry.
	
	If the serialization method is not included, but the class' prototype has an instance method
	named `__serialize__`, this is used. In similar fashion is the materialization method is not
	provided, but the class' constructor has a static method named `__materialize__`, this is used.
	Otherwise the default implementations are used.
	*/
	constructor: function Serialization(_id, _class, serialization, materialization) {
		if (Serialization.__registry__.hasOwnProperty(_id)) {
			return Serialization.__registry__[_id];
		} else {
			raiseIf(!_id, "Invalid id '", _id, "'!");
			this._id = _id;
			raiseIf(typeof _class !== 'function', 
				"Serialization's class must be a function (and not ", typeof _class, ")!");
			this._class = _class;
			if (!serialization) {
				if (typeof _class.prototype.__serialize__ === 'function') {
					this.serialization = function serialization(obj) {
						return obj.__serialize__();
					};
				}
			} else {
				raiseIf(typeof serialization !== 'function', 
					"Serialization method must be a function (and not ", typeof serialization, ")!");
				this.serialization = serialization;
			}
			if (!materialization) {
				if (typeof _class.__materialize__ === 'function') {
					this.materialization = _class.__materialize__.bind(_class);
				}
			} else {
				raiseIf(typeof materialization !== 'function',
					"Serialization method must be a function (and not ", typeof materialization, ")!");
				this.materialization = materialization;
			}
			Serialization.__registry__[_id] = this;
		}
	},

	/** Registering a class simply means creating an instance of `Serialization` for it.
	*/
	"static register": function register(_id, _class, serialization, materialization) {
		return new Serialization(_id, _class, serialization, materialization);
	},
	
	/** The default `serialization` method creates an object with all the own properties of the 
	instance, adds the serialization `id`. It is assumed that the result can be properly 
	_stringified_ using JSON. This is not done in the function so it may be included in the
	serialization of another object.
	*/
	serialization: function serialization(obj) {
		return copy({'._id': this._id}, obj);
	}, 
	
	/** Returns the serialization of the given `obj` as registered for the given `id`.
	*/
	"static serialize": function serialize(id, obj) {
		var s = Serialization.__registry__[id];
		raiseIf(!s, "No serialization method found for ", id, "!");
		return s.serialization(obj);
	},
	
	/** The default `materialization` method calls the constructor with the given `data`. If `data`
	is not an object it is parsed as JSON.
	*/
	materialization: function materialization(data) {
		if (typeof data !== 'object') {
			data = JSON.parse(data +'');
		}
		return new this._class(data);
	},
	
	/** The method `Serialization.materialize` can be use to create an object of a registered class,
	given its serialization. If the `id` is not provided it will be retrieved from the `data`. 
	*/
	"static materialize": function materialize(data, id) {
		if (!id) {
			raiseIf(!data, "No data provided!");
			if (typeof data !== 'object') {
				data = JSON.parse(data +'');
			}
			id = data['._id'];
		}
		var s = Serialization.__registry__[id];
		raiseIf(!s, "No materialization method found for ", id, "!");
		return s.materialization(data);
	}
}); // Serialization