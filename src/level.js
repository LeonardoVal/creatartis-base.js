/** basis/level.js:
	Leveling of native prototypes for outdated engines.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
function __ifAbsent__(obj, id, member) {
	if (!obj.hasOwnProperty(id)) {
		obj[id] = member;
	}
}

// Function ////////////////////////////////////////////////////////////////////

__ifAbsent__(Function.prototype, 'bind', function bind() {
	var _function = this,
		_this = arguments[0],
		_args = Array.prototype.slice.call(arguments, 1);
	return function bound() {
		return _function.apply(_this, _args.concat(Array.prototype.slice.call(arguments)));
	};
});

// String. /////////////////////////////////////////////////////////////////////

__ifAbsent__(String.prototype, 'contains', function contains(searchString, position) {
	position = isNaN(position) ? 0 : +position|0;
	searchString = searchString +'';
	var len = searchString.length;
	for (; position + len <= this.length; position++) {
		if (this.substr(position, len) == searchString) {
			return true;
		}
	}
	return false;
});

__ifAbsent__(String.prototype, 'endsWith', function endsWith(searchString, endPosition) {
	throw new Error("String.prototype.endsWith() has not been implemented."); //FIXME
});

/* String.repeat(count=0):
	Returns this string repeated n times.
	See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/prototype#Examples>.
*/
__ifAbsent__(String.prototype, 'repeat', function repeat(count) {
	count = +count;
	if (isNaN(count) || count <= 0) {
		return '';
	} else if (count === 1) {
		return this;
	} else {
		var result = this.repeat(count >> 1);
		return count % 2 ? result + result + this : result + result;
	}
});

__ifAbsent__(String.prototype, 'startsWith', function startsWith() {
	throw new Error("String.prototype.startsWith() has not been implemented."); //FIXME
});

// Number //////////////////////////////////////////////////////////////////////

__ifAbsent__(Number, 'isNaN', function isNaN() {
	/* See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN>. */
	return typeof n === 'number' && isNaN(n);
});

// Array. //////////////////////////////////////////////////////////////////////

__ifAbsent__(Array, 'of', function of() {
	return Array.prototype.slice.call(arguments);
});

__ifAbsent__(Array.prototype, 'copyWithin', function copyWithin(target, start, end) {
	throw new Error("Array.prototype.copyWithin() has not been implemented."); //FIXME
}); 

__ifAbsent__(Array.prototype, 'every', function every(callbackfn, thisArg) {
	throw new Error("Array.prototype.every() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'fill', function fill(value, start, end) {
	throw new Error("Array.prototype.fill() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'filter', function filter(callbackfn, thisArg) {
	throw new Error("Array.prototype.filter() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'find', function find(predicate, thisArg) {
	throw new Error("Array.prototype.find() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'findIndex', function findIndex(predicate, thisArg) {
	throw new Error("Array.prototype.find() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'forEach', function forEach(callbackfn, thisArg) {
	throw new Error("Array.prototype.forEach() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'map', function map(callbackfn, thisArg) {
	throw new Error("Array.prototype.map() has not been implemented."); //FIXME
});

__ifAbsent__(Array.prototype, 'some', function some(callbackfn, thisArg) {
	throw new Error("Array.prototype.some() has not been implemented."); //FIXME
});

/* TODO
// Array. //////////////////////////////////////////////////////////////////////

	__augment__(Array.prototype, {
		/** Array.repeat(n=0):
			Returns this array repeated n times. Similar to <String.repeat>.
		* /
		repeat: function repeat(n) {
			n = +n;
			if (isNaN(n) || n <= 0) {
				return [];
			} else if (n === 1) {
				return this.slice();
			} else {
				var result = this.repeat(n >> 1);
				return n % 2 ? result.concat(result).concat(this) : result.concat(result);
			}
		}
	});
	
	__level__(Array.prototype, {
		/* See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map>.
		* /
		map: function map(callback, _this) {
			if (typeof callback !== "function") {
				throw new TypeError("Array.map: callback is not a function!");
			}
			var len = this.length >>> 0, result = new Array(len), i;
			for(i = 0; i < len; i++) if (i in this) {
				result[i] = callback.call(_this, this[i], i, this);
			}
			return result;
		},
		
		/* See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter>.
		* /
		filter: function filter(callback, _this) {
			if (typeof callback !== "function") {
				throw new TypeError("Array.filter: callback is not a function!");
			}
			var len = this.length >>> 0, result = [], i;
			for(i = 0; i < len; i++) {
				if (i in this && callback.call(_this, this[i], i, this)) {
					result.push(this[i]);
				}
			}
			return result;
		},
		
		/* See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach>.
		* /
		forEach: function forEach(callback, _this) {
			if (typeof callback !== "function") {
				throw new TypeError("Array.forEach: callback is not a function!");
			}
			for (var i = 0, len = this.length; i < len; ++i) if (i in this) {
				callback.call(_this, this[i], i, this);
			}
		}
		
		//TODO <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every>.
		//TODO <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some>.
		//TODO <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf>.
		//TODO <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf>.
	});

// Function. ///////////////////////////////////////////////////////////////////

	__augment__(Function.prototype, {
		/** lowpass(maxFrequency=1, this, args...):
			Returns a function that limits the calls to this function upto the 
			given maximum frequency (in calls per second).
			See Underscore's throttle().
		* /
		lowpass: function lowpass(maxFrequency, _this) {
			maxFrequency = isNaN(maxFrequency) ? 1 : +maxFrequency;
			var minTime = Math.round(1000 / maxFrequency),
				f = this,
				lastTime = -Infinity,
				lastResult;
			return function () {
				var time = Date.now();
				if (time - lastTime >= minTime) {
					lastTime = time;
					return lastResult = f.apply(typeof _this === 'undefined' ? this : _this, arguments);
				} else {
					return lastResult;
				}
			};
		}		
	});
*/

