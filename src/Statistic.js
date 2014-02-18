/* Component representing statistical accounting for one concept.
*/
var Statistic = exports.Statistic = declare({
	/** new Statistic(keys):
		Statistical logger object, representing one numerical value.
	*/
	constructor: function Statistic(keys) {
		switch (typeof keys) {
			case 'undefined': break;
			case 'object': 
				if (keys !== null) {
					this.keys = keys;
					break;
				}
			default: this.keys = keys === null ? '' : keys +'';
		}
		this.reset(); // At first all stats must be reset.
	},
	
	/** Statistic.reset():
		Resets the statistics, and returns this object for chaining.
	*/
	reset: function reset() {
		this.__count__ = 0; 
		this.__sum__ = 0.0; 
		this.__sqrSum__ = 0.0; 
		this.__min__ = Infinity;
		this.__max__ = -Infinity;
		this.__minData__ = undefined;
		this.__maxData__ = undefined;
		return this; // For chaining.
	},

	/** Statistic.applies(keys):
		Checks if all the given keys are this statistic's keys.
	*/
	applies: function applies(keys) {
		if (typeof keys === 'undefined') {
			return false;
		} else if (keys === null) {
			keys = '';
		}
		switch (typeof this.keys) {
			case 'undefined': return false;
			case 'object':
				if (typeof keys === 'object') {
					if (Array.isArray(this.keys) && Array.isArray(keys)) {
						for (var i in keys) {
							if (this.keys.indexOf(keys[i]) < 0) {
								return false;
							}
						}
					} else { 
						for (var i in keys) {
							if (typeof this.keys[i] === 'undefined' || keys[i] !== this.keys[i]) {
								return false;
							}
						}
					}
					return true;
				} else {
					return false;
				}
			default: return typeof keys !== 'object' && this.keys === keys +'';
		}
	},
	
	/** Statistic.add(value, data=none):
		Updates the statistics with the given value. Optionally data about 
		the instances can be attached.
	*/
	add: function add(value, data) {
		if (value === undefined) {
			value = 1;
		} else if (isNaN(value)) {
			raise("Statistics.add(): Value ", value, " cannot be added."); 
		}
		this.__count__ += 1;
		this.__sum__ += value;
		this.__sqrSum__ += value * value;
		if (this.__min__ > value) {
			this.__min__ = value;
			this.__minData__ = data;
		}
		if (this.__max__ < value) {
			this.__max__ = value;
			this.__maxData__ = data;
		}
		return this; // For chaining.
	},

	/** Statistic.DEFAULT_GAIN_FACTOR=0.99:
		Default factor used in the gain() method.
	*/
	DEFAULT_GAIN_FACTOR: 0.99,
	
	/** Statistic.gain(value, factor=DEFAULT_GAIN_FACTOR, data=none):
		Like add, but fades previous values by multiplying them by the given 
		factor. This is useful to implement schemes similar to exponential 
		moving averages.
	*/
	gain: function gain(value, factor, data) {
		factor = isNaN(factor) ? this.DEFAULT_GAIN_FACTOR : +factor;
		this.__count__ *= factor;
		this.__sum__ *= factor;
		this.__sqrSum__ *= factor;
		return this.add(value, data);
	},
	
	/** Statistic.addAll(values, data=none):
		Adds all the given values (using this.add()).
	*/
	addAll: function addAll(values, data) {	
		for (var i = 0; i < values.length; i++) {
			this.add(values[i], data);
		}
		return this; // For chaining.
	},
	
	/** Statistic.gainAll(values, factor=DEFAULT_GAIN_FACTOR, data=none):
		Gains all the given values (using this.gain()).
	*/
	gainAll: function gainAll(values, factor, data) {	
		for (var i = 0; i < values.length; i++) {
			this.gain(values[i], factor, data);
		}
		return this; // For chaining.
	},
	
	/** Statistic.count():
		Get the current count, or 0 if values have not been added.
	*/
	count: function count() {
		return this.__count__;
	},
	
	/** Statistic.sum():
		Get the current sum, or zero if values have not been added.
	*/
	sum: function sum() {
		return this.__sum__;
	},
	
	/** Statistic.squareSum():
		Get the current sum of squares, or zero if values have not been added.
	*/
	squareSum: function squareSum() {
		return this.__sqrSum__;
	},
	
	/** Statistic.minimum():
		Get the current minimum, or Infinity if values have not been added.
	*/
	minimum: function minimum() {
		return this.__min__;
	},
	
	/** Statistic.maximum():
		Get the current maximum, or -Infinity if values have not been added.
	*/
	maximum: function maximum() {
		return this.__max__;
	},
	
	/** Statistic.minData():
		Get the data associated with the current minimum, or undefined if there
		is not one.
	*/
	minData: function minData() {
		return this.__minData__;
	},
	
	/** Statistic.maxData():
		Get the data associated with the current maximum, or undefined if there
		is not one.
	*/
	maxData: function maxData() {
		return this.__maxData__;
	},

	/** Statistic.average():
		Calculates the current average, or zero if values have not been added.
	*/
	average: function average() {	
		var count = this.count();
		return count > 0 ? this.sum() / count : 0.0;
	},
	
	/** Statistic.variance(center=average):
		Calculates current variance, as the average squared difference of each
		element with the center, which is equal to the average by default.
		Returns zero if values have not been added.
	*/
	variance: function variance(center) {
		if (isNaN(center)) {
			center = this.average();
		}
		var count = this.count();
		return count > 0 ? center * center + (this.squareSum() - 2 * center * this.sum()) / count : 0.0;
	},

	/** Statistic.standardDeviation(center=average):
		Calculates current standard deviation, as the square root of the current
		variance.
	*/
	standardDeviation: function standardDeviation(center) {
		return Math.sqrt(this.variance(center));
	},
	
	/** Statistic.startTime(timestamp=now):
		Starts a chronometer for this statistic.
	*/
	startTime: function startTime(timestamp) {
		var chronometer = this.__chronometer__ || (this.__chronometer__ = new Chronometer());
		return chronometer.reset(timestamp);
	},
	
	/** Statistic.addTime(data=undefined):
		Adds to this statistic the time since startTime was called.
	*/
	addTime: function addTime(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.time(), data);
	},

	/** Statistic.addTick(data=undefined):
		Adds to this statistic the time since startTime was called, and resets 
		the chronometer.
	*/
	addTick: function addTick(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.tick(), data);
	},
	
	/** Statistic.addStatistic(stat):
		Adds the values in the given Statistic object to this one.
	*/
	addStatistic: function addStatistic(stat) {
		this.__count__ += stat.__count__; 
		this.__sum__ += stat.__sum__; 
		this.__sqrSum__ += stat.__sqrSum__;
		if (stat.__min__ < this.__min__) {
			this.__min__ = stat.__min__;
			this.__maxData__ = stat.__maxData__;
		}
		if (stat.__max__ > this.__max__) {
			this.__max__ = stat.__max__;
			this.__maxData__ = stat.__maxData__;
		}		
		return this;
	},
	
	/** Statistic.toString(sep='\t'):
		Prints statistic's id, count, minimum, average, maximum and standard 
		deviation, separated by tabs.
	*/
	toString: function toString(sep) {
		sep = ''+ (sep || '\t');
		return [Object.keys(this.keys).join(' '), this.count(), this.minimum(), this.average(), 
			this.maximum(), this.standardDeviation()].join(sep);
	}
}); // declare Statistic.
