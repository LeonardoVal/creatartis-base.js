/** basis/stats.js:
	Statistical accounting, measurements and related functions.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Chronometer. ////////////////////////////////////////////////////////////////

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
	
// Statistic. //////////////////////////////////////////////////////////////////

function __getKeySet__(keys) {
	var result = {};
	if (typeof keys !== 'undefined' || keys !== null) {
		if (!Array.isArray(keys)) {
			if (typeof keys === 'object') {
				keys = Object.keys(keys);
			} else {
				keys = (keys +'').split(/\s+/);
			}
		}
		keys.forEach(function (key) {
			result[key +''] = true;
		});		
	}
	return result;
}

var Statistic = exports.Statistic = declare({
	/** new Statistic(keys):
		Statistical logger object, representing one numerical value.
	*/
	constructor: function Statistic(keys) {
		this.keys = __getKeySet__(keys);
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
	
	/** Statistic.applies(keys):
		Checks if one of the given keys is one of this statistic's keys.
	*/
	applies: function applies(keys) {
		keys = __getKeySet__(keys);
		for (var key in keys) {
			if (this.keys.hasOwnProperty(key)) {
				return true;
			}
		}
		return false;
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
	
// Statistics. /////////////////////////////////////////////////////////////////
	
var Statistics = exports.Statistics = declare({
	/** new Statistics():
		Bundle of Statistic objects by name.
	*/
	constructor: function Statistics() {
		this.__stats__ = {};
	},
	
	/** Statistics.stats(keys):
		Get the Statistic objects that have at least one of the given keys.
	*/
	stats: function stats(keys) {
		return iterable(this.__stats__).map(function (keyVal) {
			return keyVal[1];
		}, function (stat) {
			return stat.applies(keys);
		}).toArray();
	},
	
	/** Statistics.stat(keys):
		Get the Statistic that applies to all the given keys, or create it if it 
		does not exist.
	*/
	stat: function stat(keys) {
		var id = JSON.stringify(__getKeySet__(keys));
		return this.__stats__[id] || (this.__stats__[id] = new Statistic(keys));
	},
	
	/** Statistics.reset(keys):
		Reset all the stats with one of the given keys.
	*/
	reset: function reset(keys) {
		this.stats(keys).forEach(function (stat) {
			stat.reset();
		});
		return this; // For chaining.
	},

	/** Statistics.add(keys, value, data):
		Shortcut method to add a value to the Statistic with the given keys.
	*/
	add: function add(keys, value, data) {
		return this.stat(keys).add(value, data);
	},
	
	/** Statistics.gain(keys, value, factor, data):
		Shortcut method to gain a value to the Statistic with the given keys.
	*/
	gain: function gain(keys, value, factor, data) {
		return this.stat(keys).gain(value, factor, data);
	},
	
	/** Statistics.addAll(keys, values, data):
		Shortcut method to add all values to the Statistic with the given keys.
	*/
	addAll: function addAll(keys, values, data) {
		return this.stat(keys).addAll(values, data);
	},
	
	/** Statistics.gainAll(keys, values, factor, data):
		Shortcut method to add all values to the Statistic with the given keys.
	*/
	gainAll: function gainAll(keys, values, factor, data) {
		return this.stat(keys).addAll(values, data);
	},

	/** Statistics.addObject(obj, data):
		Adds the values in the given object, one stat per member. If a member is
		an array, all numbers in the array are added.
	*/
	addObject: function addObject(obj, data) {
		raiseIf(!obj, "Cannot add object "+ JSON.stringify(obj) +".");
		for (var name in obj) {
			if (Array.isArray(obj[name])) {
				this.addAll(name, obj[name], data);
			} else {
				this.add(name, obj[name], data);
			}
		}
		return this; // For chaining.
	},
	
	/** Statistics.addStatistic(stat, keys=stat.keys):
		Adds the values in the given Statistic object to the one with the same
		keys in this object. If there is none one is created. This does not put
		the argument as an statistic of this object.
	*/
	addStatistic: function addStatistic(stat, keys) {
		return this.stat(typeof keys !== 'undefined' ? keys : stat.keys).addStatistic(stat);
	},
	
	/** Statistics.addStatistics(stats, keys=all):
		Combines the stats of the given Statistic object with this one's.
	*/
	addStatistics: function addStatistics(stats, keys) {
		var self = this;
		stats.stats(keys).forEach(function (stat) {
			self.stat(stat.keys).addStatistic(stat);
		})
		return this;
	},
	
	/** Statistic.accumulation(keys):
		Creates a new Statistic that accumulates all that apply to the given 
		keys.
	*/
	accumulation: function accumulation(keys) {
		var acc = new Statistic(keys);
		this.stats(keys).forEach(function (stat) {
			acc.addStatistic(stat);
		});
		return acc;
	},
	
	// Shortcut methods. ///////////////////////////////////////////////////////
	
	/** Statistics.count(keys):
		Shortcut method to get the count of the accumulation of the given keys.
	*/
	count: function count(keys) {
		return this.accumulation(keys).count();
	},
	
	/** Statistics.sum(keys):
		Shortcut method to get the sum of the accumulation of the given keys.
	*/
	sum: function sum(keys) {
		return this.accumulation(keys).sum();
	},
	
	/** Statistics.squareSum(keys):
		Shortcut method to get the sum of squares of the accumulation of the 
		given keys.
	*/
	squareSum: function squareSum(keys) {
		return this.accumulation(keys).squareSum();
	},
	
	/** Statistics.minimum(keys):
		Shortcut method to get the minimum value of the accumulation of the 
		given keys.
	*/
	minimum: function minimum(keys) {
		return this.accumulation(keys).minimum();
	},
	
	/** Statistics.maximum(keys):
		Shortcut method to get the maximum value of the accumulation of the 
		given keys.
	*/
	maximum: function maximum(keys) {
		return this.accumulation(keys).maximum();
	},
	
	/** Statistics.average(keys):
		Shortcut method to get the average value of the accumulation of the 
		given keys.
	*/
	average: function average(keys) {
		return this.accumulation(keys).average();
	},
	
	/** Statistics.variance(keys, center=average):
		Shortcut method to get the variance of the accumulation of the 
		given keys.
	*/
	variance: function variance(keys, center) {
		return this.accumulation(keys).variance(center);
	},
	
	/** Statistics.standardDeviation(keys, center=average):
		Shortcut method to get the standard deviation of the accumulation of the 
		given keys.
	*/
	standardDeviation: function standardDeviation(keys, center) {
		return this.accumulation(keys).standardDeviation(center);
	},
	
	/** Statistics.startTime(keys, timestamp=now):
		Shortcut method to start the timer of the Statistic with the given keys.
	*/
	startTime: function startTime(keys, timestamp) {
		return this.stat(keys).startTime(timestamp);
	},
	
	/** Statistics.addTime(keys, data=undefined):
		Shortcut method to add the time elapsed since the timer of the Statistic
		with the given keys was started.
	*/
	addTime: function addTime(keys, data) {
		return this.stat(keys).addTime(data);
	},
	
	/** Statistics.addTick(keys, data=undefined):
		Shortcut method to add the time elapsed since the timer of the Statistic
		with the given keys was started, and reset it.
	*/
	addTick: function addTick(keys, data) {
		return this.stat(keys).addTick(data);
	},
	
	/** Statistics.toString(fsep='\t', rsep='\n'):
		Formats all the statistics in a string.
	*/
	toString: function toString(fsep, rsep) {
		fsep = ''+ (fsep || '\t');
		rsep = ''+ (rsep || '\n');
		var stats = this.__stats__;
		return Object.keys(stats).map(function (name) {
			return stats[name].toString(fsep);
		}).join(rsep);
	}
}); // declare Statistics.
