/* Statistical accounting, measurements and related functions.
*/
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

	/** Statistics.__id__(keys):
		Generates an id for a Statistic object with the given keys.
	*/
	__id__: function __id__(keys) {
		if (typeof keys === 'object' && keys !== null) {
			if (Array.isArray(keys)) {
				return JSON.stringify(keys.slice().sort());
			} else {
				return Object.keys(keys).sort().map(function (n) {
					return JSON.stringify(n) +':'+ JSON.stringify(keys[n]);
				}).join(',');
			}
		} else {
			return JSON.stringify(keys)+'';
		}
	},
	
	/** Statistics.stat(keys):
		Get the Statistic that applies to all the given keys, or create it if it 
		does not exist.
	*/
	stat: function stat(keys) {
		var id = this.__id__(keys);
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
