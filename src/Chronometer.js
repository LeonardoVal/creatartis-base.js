/** # Chronometer

A Chronometer is a simple tool to measure time.
*/
var Chronometer = exports.Chronometer = declare({
	/** The constructor may take a timestamp to initiate the chronometer, 
	otherwise it uses the current time.
	*/
	constructor: function Chronometer(t) {
		this.reset(t);
	},
	
	/** Resetting the chronometer sets its `__timestamp__` property to the given
	time or now by default.
	*/
	reset: function reset(t) {
		return this.__timestamp__ = t || Date.now();
	},

	/** `time()` gets the elapsed time since the creation or resetting of the
	chronometer.
	*/
	time: function time() {
		return Date.now() - this.__timestamp__;
	},

	/** `tick(t=now)` gets the elapsed time since the creation or resetting of 
	the chronometer, and resets it.
	*/
	tick: function tick(t) {
		var result = this.time();
		this.reset(t);
		return result;
	},

	/** `chronometer(f, times=1)` executes the parameterless function `f` the 
	given number of `times` (1 by default) and logs the time each run takes. 
	
	Finally, returns the average of all those measurements.
	*/
	chronometer: function chronometer(f, times) {
		times = times || 1;
		var total = 0.0;
		for (var i = 0; i < times; i++) {
			this.reset();
			f.call(this);
			total += this.time();
		}
		return total / times;
	}
}); // declare Chronometer.
