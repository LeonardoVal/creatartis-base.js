/* Simple event manager.
*/
var Events = exports.Events = declare({
/** new Events(config):
	Event handler that manages callbacks registered as listeners.
*/
	constructor: function Events(config) {
		initialize(this, config)
		/** Events.maxListeners=Infinity:
			Maximum amount of listeners these events can have.
		*/
			.number('maxListeners', { defaultValue: Infinity, coerce: true, minimum: 1 })
		/** Events.isOpen=true:
			An open Events accepts listeners to any event. Otherwise event names
			have to be specified previously via the 'events' property in the 
			configuration.
		*/
			.bool('isOpen', { defaultValue: true });
		var __listeners__ = this.__listeners__ = {};
		config && Array.isArray(config.events) && config.events.forEach(function (eventName) {
			__listeners__[eventName] = [];
		});
	},

	/** Events.listeners(eventName):
		Returns an array with the listeners for the given event.
	*/
	listeners: function listeners(eventName) {
		if (this.__listeners__.hasOwnProperty(eventName)) {
			return this.__listeners__[eventName].slice(); // Return a copy of the array.
		} else {
			return [];
		}
	},
	
	/** Events.emit(eventName, ...args):
		Emits an event with the given arguments. Listeners' callbacks are
		called asynchronously.
	*/
	emit: function emit(eventName) {
		var args;
		if (Array.isArray(eventName)) {
			var events = this;
			args = Array.prototype.slice.call(arguments);
			eventName.forEach(function (name) {
				args[0] = name;
				events.emit.apply(this, args);
			});
		}
		if (!this.__listeners__.hasOwnProperty(eventName)) {
			return false;
		}
		args = Array.prototype.slice.call(arguments, 1);
		var listeners = this.__listeners__[eventName];
		this.__listeners__[eventName] = this.__listeners__[eventName]
			.filter(function (listener) {
				if (listener[1] > 0) {
					setTimeout(function () {
						return listener[0].apply(Global, args)
					}, 1);
					listener[1]--;
					return listener[1] > 0;
				} else {
					return false;
				}
			});
		return true;
	},
	
	/** Events.on(eventName, callback, times=Infinity):
		Registers a callback to listen to the event the given number of times,
		or always by default.
	*/
	on: function on(eventName, callback, times) {
		if (Array.isArray(eventName)) {
			var events = this;
			eventName.forEach(function (name) {
				events.on(name, callback, times);
			});
		} else {
			if (!this.__listeners__.hasOwnProperty(eventName)) {
				raiseIf(!this.isOpen, "Event ", eventName, " is not defined.");
				this.__listeners__[eventName] = [];
			}
			var listeners = this.__listeners__[eventName];
			raiseIf(this.listeners.length >= this.maxListeners,
				"Cannot have more than ", this.maxListeners, " listeners for event ", eventName, ".");
			times = (+times) || Infinity;
			listeners.push([callback, times]);
		}
	},

	/** Events.once(eventName, callback):
		Registers a callback to listen to the event only once.
	*/
	once: function once(eventName, callback) {
		return this.on(eventName, callback, 1);
	},

	/** Events.off(eventName, callback):
		Deregisters the callback from the event.
	*/
	off: function off(eventName, callback) {
		if (Array.isArray(eventName)) {
			var events = this;
			eventName.forEach(function (name) {
				events.off(name, callback, times);
			});
		} else if (this.__listeners__.hasOwnProperty(eventName)) {
			this.__listeners__[eventName] = this.__listeners__[eventName]
				.filter(function (listener) {
					return listener[0] !== callback;
				});
		}
	}
}); // declare Events.
