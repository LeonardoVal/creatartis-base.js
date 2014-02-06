/* Component to measure time and related functionality.
*/
var Chronometer = exports.Chronometer = declare({
	/** new Chronometer(time):
		Utility object for measuring time lapses.
	*/
	constructor: function Chronometer(t) {
		this.reset(t);
	},
	
	/** Chronometer.reset(time=now):
		Resets the chronometer's to the given time or now by default.
	*/
	reset: function reset(t) {
		return this.__timestamp__ = t || (new Date()).getTime();
	},

	/** Chronometer.time():
		Get the elapsed time since the creation or resetting of the chronometer.
	*/
	time: function time() {
		return (new Date()).getTime() - this.__timestamp__;
	},

	/** Chronometer.tick():
		Get the elapsed time since the creation or resetting of the chronometer,
		and resets it.
	*/
	tick: function tick() {
		var result = this.time()
		this.reset();
		return result;
	},

	/** Chronometer.chronometer(f, times=1):
		Executes the parameterless function f the given number of times and logs 
		the time each run takes. Returns the average time.
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
