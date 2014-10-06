/** # Statistic

Component representing statistical accounting for one concept.
*/
var Statistic = exports.Statistic = declare({
	/** Every statistic object has a set of keys that identify the numerical 
	value it represents. This can be as simple as one string, or an object 
	with many values for different aspects of the statistic.
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
	
	/** Resetting a statistic deletes all registered values and sets all 
	properties to zero.
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

	/** An Statistic object may apply to a certain concept or not, depending on
	its `keys`. When dealing with sets of keys (objects), `applies(keys)` checks
	if all the given keys are this statistic's keys.
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
	
	// ## Querying statistics ##################################################
	
	/** `count()` gets the current count, or 0 if values have not been added.
	*/
	count: function count() {
		return this.__count__;
	},
	
	/** `sum()` gets the current sum, or zero if values have not been added.
	*/
	sum: function sum() {
		return this.__sum__;
	},
	
	/** `squareSum()` gets the current sum of squares, or zero if values have 
	not been added.
	*/
	squareSum: function squareSum() {
		return this.__sqrSum__;
	},
	
	/** `minimum()` gets the current minimum, or Infinity if values have not 
	been added.
	*/
	minimum: function minimum() {
		return this.__min__;
	},
	
	/** `maximum()` gets the current maximum, or -Infinity if values have not 
	been added.
	*/
	maximum: function maximum() {
		return this.__max__;
	},
	
	/** `minData()` gets the data associated with the current minimum, or 
	`undefined` if there is not one.
	*/
	minData: function minData() {
		return this.__minData__;
	},
	
	/** `maxData()` gets the data associated with the current maximum, or 
	`undefined` if there is not one.
	*/
	maxData: function maxData() {
		return this.__maxData__;
	},

	/** `average()` calculates the current average, or zero if values have not 
	been added.
	*/
	average: function average() {	
		var count = this.count();
		return count > 0 ? this.sum() / count : 0.0;
	},
	
	/** `variance(center=average)` calculates current variance, as the average 
	squared difference of each element with the center, which is equal to the 
	average by default. Returns zero if values have not been added.
	*/
	variance: function variance(center) {
		if (isNaN(center)) {
			center = this.average();
		}
		var count = this.count();
		return count > 0 ? center * center + (this.squareSum() - 2 * center * this.sum()) / count : 0.0;
	},

	/** `standardDeviation(center=average)` calculates current standard 
	deviation, as the square root of the current variance.
	*/
	standardDeviation: function standardDeviation(center) {
		return Math.sqrt(this.variance(center));
	},
	
	// ## Updating statistics ##################################################
	
	/** Values are added to a statistic with `add(value, data=none)`, which 
	updates the statistic. Optionally data about the instances can be attached.
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

	/** `addAll(values, data=none)` adds all the given values (using `add()`).
	*/
	addAll: function addAll(values, data) {	
		for (var i = 0; i < values.length; i++) {
			this.add(values[i], data);
		}
		return this; // For chaining.
	},
	
	/** `gain(value, factor=DEFAULT_GAIN_FACTOR, data=none)` is similar to 
	`add()`, but fades previous values by multiplying them by the given factor.
	This is useful to implement schemes similar to exponential moving averages.
	*/
	gain: function gain(value, factor, data) {
		factor = isNaN(factor) ? this.DEFAULT_GAIN_FACTOR : +factor;
		this.__count__ *= factor;
		this.__sum__ *= factor;
		this.__sqrSum__ *= factor;
		return this.add(value, data);
	},

	/** The `DEFAULT_GAIN_FACTOR=0.99` is used in the `gain()` method.
	*/
	DEFAULT_GAIN_FACTOR: 0.99,
	
	/** `gainAll(values, factor=DEFAULT_GAIN_FACTOR, data=none)` gains all the 
	given values (using `gain()`).
	*/
	gainAll: function gainAll(values, factor, data) {	
		for (var i = 0; i < values.length; i++) {
			this.gain(values[i], factor, data);
		}
		return this; // For chaining.
	},
	
	/** `addStatistic(stat)` adds the values in the given Statistic object to 
	this one.
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
	
	// ### Time handling #######################################################
	
	/** `startTime(timestamp=now)` starts a chronometer for this statistic.
	*/
	startTime: function startTime(timestamp) {
		var chronometer = this.__chronometer__ || (this.__chronometer__ = new Chronometer());
		return chronometer.reset(timestamp);
	},
	
	/** `addTime(data=undefined)` adds to this statistic the time since 
	`startTime` was called.
	*/
	addTime: function addTime(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.time(), data);
	},

	/** `addTick(data=undefined)` adds to this statistic the time since 
	`startTime` was called, and resets the chronometer.
	*/
	addTick: function addTick(data) {
		raiseIf(!this.__chronometer__, "Statistic's chronometer has not been started.");
		return this.add(this.__chronometer__.tick(), data);
	},
	
	// ## Tests and inference ##################################################
	
	/** The static `z_test` method returns the mean statistic for 
	[z-tests](http://en.wikipedia.org/wiki/Z-test) given the expected `mean` and
	`variance` and the `sampleCount` and `sampleMean`.	
	*/
	'static z_test': function z_test(mean, variance, sampleCount, sampleMean) {
		var r = {},
			z = r.z = (sampleMean - mean) / Math.sqrt(variance / sampleCount),
			p = math.gauss_cdf(z);
		r.p_lessThan    = z < 0 ? p : 0;
		r.p_greaterThan = z > 0 ? 1 - p : 0;
		r.p_notEqual    = z != 0 ? 2 * Math.max(r.p_lessThan, r.p_greaterThan) : 0; //TODO Check this.
		return r;
	},
	
	/** The instance `z_test` method is analogue to the static one, using this 
	object's data. The `variance` is assumed to this sample's variance by 
	default.
	*/
	z_test: function z_test(mean, variance) {
		variance = isNaN(variance) ? this.variance() : +variance;
		return Statistic.z_test(mean, variance, this.count(), this.average());
	},
	
	/** The static `t_test1` method returns the mean statistic for 
	[Student's one-sample t-tests](http://en.wikipedia.org/wiki/Student%27s_t-test#One-sample_t-test) 
	given: `mean`, `sampleCount`, `sampleMean` and `sampleVariance`.
	*/
	'static t_test1': function t_test1(mean, sampleCount, sampleMean, sampleVariance) {
		return { 
			t: (sampleMean - mean) / (sampleVariance / Math.sqrt(sampleCount))
		};
	},
	
	/** The instance `t_test1` method is analogue to the static one, using this 
	object's data. The `mean` is assumed to be zero by default.
	*/
	t_test1: function t_test1(mean, sampleCount, sampleMean, sampleVariance) {
		return Statistic.t_test1(
			isNaN(mean) ? 0.0 : +mean,
			isNaN(sampleCount) ? this.count() : +sampleCount,
			isNaN(sampleMean) ? this.average() : +sampleMean,
			isNaN(sampleVariance) ? this.variance() : +sampleVariance
		);
	},
	
	/** The static `t_test2` method returns the mean statistic for 
	[Student's two-sample t-tests](http://en.wikipedia.org/wiki/Student%27s_t-test#Unequal_sample_sizes.2C_equal_variance) 
	given the two sample groups' count, mean and variance.
	*/
	'static t_test2': function t_test2(sampleCount1, sampleCount2, 
			sampleMean1, sampleMean2, sampleVariance1, sampleVariance2) {
		var pooledVariance = (((sampleCount1 - 1) * sampleVariance1 + (sampleCount2 - 1) * sampleVariance2)
			/ (sampleCount1 + sampleCount2 - 2));
		return { 
			t: (sampleMean1 - sampleMean2) / Math.sqrt(pooledVariance * (1 / sampleCount1 + 1 / sampleCount2))
		};
	},
	
	/** The instance `t_test2` method is analogue to the static one, using this 
	object's and another one's data.
	*/
	t_test2: function t_test2(other) {
		return Statistic.t_test2(
			this.count(), other.count(),
			this.average(), other.average(),
			this.variance(), other.variance()
		);
	},
	
	// ## Other ################################################################
	
	/** The default string representation is the concatenation of the 
	statistic's id, count, minimum, average, maximum and standard deviation, 
	separated by tabs.
	*/
	toString: function toString(sep) {
		sep = ''+ (sep || '\t');
		var keys = typeof this.keys !== 'object' ? this.keys + '' :
			iterable(this.keys).map(function (kv) {
				return kv[0] +':'+ kv[1];
			}).join(', ')
		return [keys, this.count(), this.minimum(), this.average(), 
			this.maximum(), this.standardDeviation()].join(sep);
	}
}); // declare Statistic.
