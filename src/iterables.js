/** basis/iterables.js:
	Standard implementation of iterables and iterators (a.k.a. enumerations), 
	and many functions that can be built with it.

	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
//TODO basis.Iterable.slice(from, to, step) similar al operador [::] de Python.
//TODO basis.Iterable.tail() retorna otro iterable sin el primer elemento.
//TODO basis.Iterable.tails() retorna un iterable con iterables para todos los sufijos de la secuencia.
//TODO basis.Iterable.init() retorna otro iterable sin el último elemento.
//TODO basis.Iterable.inits() retorna un iterable con iterables para todos los prefijos de la secuencia.
//TODO basis.Iterable.take(n=1) retorna un iterable con los primeros n elementos.
//TODO basis.Iterable.drop(n=1) retorna un iterable sin los primeros n elementos.
//TODO basis.Iterable.takeWhile(condition) retorna un iterable con los primeros elementos que cumplen la condición.
//TODO basis.Iterable.dropWhile(condition) retorna un iterable sin los primeros elementos que cumplen la condición.
//TODO basis.Iterable.indexOf(x) retorna el índice de la primera ocurrencia de x en la secuencia, o -1.
//TODO basis.Iterable.indexesOf(x) retorna un iterable con los índices de las ocurrencias de x en la secuencia.
//TODO basis.Iterable.indexOfSlice(condition) retorna el índice de la primer ocurrencia de la subsecuencia en la secuencia, o -1.
//TODO basis.Iterable.indexesOfSlice(condition) retorna un iterable con los índices de las ocurrencias de la subsecuencia en la secuencia.
//TODO basis.Iterable.indexWhere(condition) retorna el índice del primer elemento en la secuencia que cumple la condición, o -1.
//TODO basis.Iterable.indexesWhere(condition) retorna un iterable con los índices de los elementos en la secuencia que cumple la condición.
//TODO basis.Iterable.groupBy(f) retorna un objeto con iterables para cada valor retornado por f y los valores correspondientes.
//TODO basis.Iterable.partition(condition) retorna dos iterables con los elementos que no cumplen y cumplen la condición dada.
//TODO basis.Iterable.pad(length, value) retorna otro iterable rellenado por derecha hasta el largo dado con el valor dado.

// Iterable constructor. ///////////////////////////////////////////////////////
	
/** new Iterable(it):
	Constructor of iterable objects. Those have a __iter__() method that 
	returns an iterator function. This iterator returns the current value 
	and advances each time it is called. When sequence ends, the iterator
	raises the iterables.STOP_ITERATION singleton exception.
	This constructor supports strings (iterating over each caracter), arrays,
	objects (key-value pairs) and functions (assuming it is the iterator
	constructor). A value of null or undefined is not allowed. Everything 
	else is assumed to be the only value of a singleton sequence.
*/
var Iterable = exports.Iterable = function Iterable(obj) {
	if (obj === null || obj === undefined) {
		throw new Error('Iterable source is null or undefined.');
	} else if (typeof obj === 'function') {
		this.__iter__ = obj;
	} else if (typeof obj === 'string') {
		this.__iter__ = Iterable.__iteratorFromString__(obj);
	} else if (Array.isArray(obj)) {
		this.__iter__ = Iterable.__iteratorFromArray__(obj);
	} else if (typeof obj === 'object') {
		if (typeof obj.__iter__ == 'function') {
			this.__iter__ = obj.__iter__.bind(obj);
		} else {
			this.__iter__ = Iterable.__iteratorFromObject__(obj);
		}
	} else {
		this.__iter__ = Iterable.__iteratorSingleton__(obj);
	}
};

/** Iterable.STOP_ITERATION:
	Error raised when an iterator has finished. It is catched by all 
	Iterable's functions.
*/
var STOP_ITERATION = Iterable.STOP_ITERATION = new Error('Sequence has ended.');

/** Iterable.stop():
	Raises the STOP_ITERATION exception. If used inside an iterator it
	breaks the iteration.
*/
Iterable.prototype.stop = function stop() {
	throw STOP_ITERATION;
};

/** Iterables.catchStop(exception):
	If the exception is STOP_ITERATION it does nothing. If it is not, the
	exception is thrown.
*/
Iterable.prototype.catchStop = function catchStop(exception) {
	if (exception !== STOP_ITERATION) {
		throw exception;
	}
};

/** iterable(x):
	Returns an iterable, either if x is already one or builds one from it.
*/
var iterable = exports.iterable = function iterable(x) {
	return x instanceof Iterable ? x : new Iterable(x);
}

/** Iterable.EMPTY:
	An empty Iterable.
*/
Iterable.EMPTY = new Iterable(stop);

// Iterables from common datatypes. ////////////////////////////////////////////

/** Iterables.__iteratorFromString__(str):
	Returns a constructor of iterators of the str string.
*/
Iterable.__iteratorFromString__ = function __iteratorFromString__(str) {
	return function __iter__() {
		var i = 0;
		return function __stringIterator__() {
			if (i < str.length) {
				return str.charAt(i++);
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

/** Iterable.__iteratorFromArray__(array):
	Returns a constructor of iterators of the given array.
*/
Iterable.__iteratorFromArray__ = function __iteratorFromArray__(array) {
	return function __iter__() {
		var i = 0;
		return function __arrayIterator__() {
			if (i < array.length) {
				return array[i++];
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

/** Iterable.__iteratorFromObject__(obj):
	Returns an iterator constructor going through obj's properties as 
	returned by Object.keys(). Each element in the sequence is an array with
	the property key and the property value.			
*/
Iterable.__iteratorFromObject__ = function __iteratorFromObject__(obj) {
	return function __iter__() {
		var keys = Object.keys(obj);
		return function __objectIterator__() {
			if (keys.length > 0) {
				var k = keys.shift();
				return [k, obj[k]];
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

/** Iterable.__iteratorSingleton__(x):
	Returns an iterator constructor with a singleton sequence with the given 
	value.
*/
Iterable.__iteratorSingleton__ = function __iteratorSingleton__(x) {
	return function __iter__() {
		var finished = false;
		return function __singletonIterator__() {
			if (!finished) {
				finished = true;
				return x;
			} else {
				throw STOP_ITERATION;
			}
		};
	};
};

// Iterables methods. //////////////////////////////////////////////////////////

/** Iterable.forEach(doFunction, ifFunction):
	Applies the doFunction to all elements complying with ifFunction, and 
	returns the last result.
	This is similar to basis.Iterable.map, but it does not return another
	iterable.
*/
Iterable.prototype.forEach = function forEach(doFunction, ifFunction) {
	var iter = this.__iter__(), x, i = 0, result;
	try { 
		for (x = iter(); true; x = iter(), i++) {
			if (!ifFunction || ifFunction(x, i)) {
				result = doFunction(x, i);
			}
		}
	} catch (err) {
		this.catchStop(err);
	}
	return result;
};

/** Iterable.toArray(array):
	Appends to the array the elements of the sequence and returns it. If no 
	array is given, a new one is used.
*/
Iterable.prototype.toArray = function toArray(array) {
	array = array || [];
	this.forEach(function (x) {
		array.push(x);
	});
	return array;
};

/** Iterable.toObject(obj={}):
	Takes an iterable of 2 element arrays and assigns to the given object 
	(or a new one by default) each key-value pairs as a property.
*/
Iterable.prototype.toObject = function toObject(obj) {
	obj = obj || {};
	this.forEach(function (x) {
		obj[x[0]] = x[1];
	});
	return obj;
};

/** Iterable.isEmpty():
	Returns if the sequence has no elements.
*/
Iterable.prototype.isEmpty = function isEmpty() {
	try {
		this.__iter__()();
		return false;
	} catch (err) {
		this.catchStop(err);
		return true;
	}
};

/** Iterable.count():
	Counts the number of elements in the sequence.
*/
Iterable.prototype.count = function count() {
	var result = 0;
	this.forEach(function (x) {
		result++;
	});
	return result;
};

/** Iterable.join(sep):
	Concatenates all strings in the sequence using sep as separator. If sep
	is not given, '' is assumed.
*/
Iterable.prototype.join = function join(sep) {
	var result = '';
	sep = ''+ (sep || '');
	this.forEach(function (x, i) { 
		result += (i === 0) ? x : sep + x; 
	});
	return result;
};

/** Iterable.sum(n=0):
	Returns the sum of all elements in the sequence, or 0 if the sequence is
	empty.
*/
Iterable.prototype.sum = function sum(n) {
	var result = isNaN(n) ? 0 : +n;
	this.forEach(function (x) { 
		result += (+x);
	});
	return result;
};

/** Iterable.min(n=Infinity):
	Returns the minimum element of all elements in the sequence, or Infinity
	if the sequence is empty.
*/
Iterable.prototype.min = function min(n) {
	var result = isNaN(n) ? Infinity : +n;
	this.forEach(function (x) { 
		x = (+x);
		if (x < result) {
			result = x; 
		}
	});
	return result;
};

/** Iterable.max(n=-Infinity):
	Returns the maximum element of all elements in the sequence, or -Infinity
	if the sequence is empty.
*/
Iterable.prototype.max = function max(n) {
	var result = isNaN(n) ? -Infinity : +n;
	this.forEach(function (x) { 
		x = (+x);
		if (x > result) {
			result = x; 
		}
	});
	return result;
};

/** Iterable.all(predicate, strict=false):
	Returns true if for all elements in the sequence the predicate returns
	true, or if the sequence is empty.
*/
Iterable.prototype.all = function all(predicate, strict) {
	predicate = typeof predicate === 'function' ? predicate : function (x) { return !!x; };
	var result = true;
	this.forEach(function (x) { 
		if (!predicate(x)) {
			result = false;
			if (!strict) {
				throw STOP_ITERATION; // Shortcircuit.
			}
		}
	});
	return result;
};

/** Iterable.any(predicate, strict=false):
	Returns false if for all elements in the sequence the predicate returns
	false, or if the sequence is empty.
*/
Iterable.prototype.any = function any(predicate, strict) {
	predicate = typeof predicate === 'function' ? predicate : function (x) { return !!x; };
	var result = false;
	this.forEach(function (x) { 
		if (predicate(x)) {
			result = true;
			if (!strict) {
				throw STOP_ITERATION; // Shortcut.
			}
		}
	});
	return result;
};

/** Iterable.map(mapFunction, filterFunction):
	Returns an iterable iterating on the results of applying mapFunction to 
	each of this iterable elements. If filterFunction is given, only elements
	for which filterFunction returns true are considered.
*/
Iterable.prototype.map = function map(mapFunction, filterFunction) {
	var from = this; // for closures.
	return new Iterable(function __iter__() {
		var iter = from.__iter__(), x, i = -1;
		return function __mapIterator__() {
			for (x = iter(); true; x = iter()) {
				i++;
				x = mapFunction ? mapFunction(x, i) : x;
				if (!filterFunction || filterFunction(x, i)) {
					return x;
				}
			}
			throw STOP_ITERATION;
		};			
	});
};

/** Iterable.filter(filterFunction, mapFunction):
	Returns an iterable of this iterable elements for which filterFunction
	returns true. If mapFunction is given it is applyed before yielding the
	elements.
*/
Iterable.prototype.filter = function filter(filterFunction, mapFunction) {
	var from = this; // for closures.
	return new Iterable(function __iter__() {
		var iter = from.__iter__(), x, i = -1;
		return function __mapIterator__() {
			while (true) {
				x = iter();
				i++;
				if (filterFunction ? filterFunction(x, i) : x) {
					return mapFunction ? mapFunction(x, i) : x;
				}
			}
			throw STOP_ITERATION;
		};
	});
};

/** Iterable.foldl(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a left associative
	operator. The initial value is used as a starting point, but if it is not
	defined, then the first element in the sequence is used.
*/
Iterable.prototype.foldl = function foldl(foldFunction, initial) {
	var iter = this.__iter__(), x;
	try {
		initial = initial === undefined ? iter() : initial;
		for (x = iter(); true; x = iter()) {
			initial = foldFunction(initial, x);
		}
	} catch (err) {
		this.catchStop(err);
	}
	return initial;
};

/** Iterable.scanl(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a left associative
	operator. Instead of returning the last result, it iterates over the 
	intermediate values in the folding sequence.
*/
Iterable.prototype.scanl = function scanl(foldFunction, initial) {
	var from = this; // for closures.
	return new Iterable(function __iter__() {
		var iter = from.__iter__(), value, count = -1;
		return function __scanlIterator__() {
			count++;
			if (count == 0) {
				value = initial === undefined ? iter() : initial;
			} else {
				value = foldFunction(value, iter());
			}
			return value;
		};
	});
};

/** Iterable.head(defaultValue):
	Returns the first element. If the sequence is empty it returns the 
	defaultValue, or raise an exception if one is not given.
*/
Iterable.prototype.head = function head(defaultValue) {
	try {
		return this.__iter__()();
	} catch (err) {
		this.catchStop(err);
		if (arguments.length < 1) {
			throw new Error("Tried to get the head value of an empty Iterable.");
		} else {
			return defaultValue;
		}
	}
};

/** Iterable.last(defaultValue):
	Returns the last element. If the sequence is empty it returns the 
	defaultValue, or raise an exception if one is not given.
*/
Iterable.prototype.last = function last(defaultValue) {
	var result, isEmpty = true, it = this.__iter__();
	try {
		for (isEmpty = true; true; isEmpty = false) {
			result = it();
		}
	} catch (err) {
		this.catchStop(err);
		if (!isEmpty) {
			return result;
		} else if (arguments.length < 1) {
			throw new Error("Tried to get the last value of an empty Iterable.");
		} else {
			return defaultValue;
		}
	}
};

/** Iterable.reverse():
	Returns an iterable with this iterable elements in reverse order.
	Warning! It stores all this iterable's elements in an array.
*/
Iterable.prototype.reverse = function reverse() {
	return new Iterable(this.toArray().reverse());
};

/** Iterable.foldr(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a right 
	associative	operator. The initial value is used as a starting point, but 
	if it is not defined, then the first element in the sequence is used.
	Warning! This is the same as doing a foldl in a reversed iterable.
*/
Iterable.prototype.foldr = function foldr(foldFunction, initial) {
	function flippedFoldFunction(x,y) {
		return foldFunction(y,x);
	}
	return this.reverse().foldl(flippedFoldFunction, initial);
};

/** Iterable.scanr(foldFunction, initial):
	Folds the elements of this iterable with foldFunction as a right 
	associative operator. Instead of returning the last result, it iterates
	over the intermediate values in the folding sequence.
	Warning! This is the same as doing a scanl in a reversed iterable.
*/
Iterable.prototype.scanr = function scanr(foldFunction, initial) {
	function flippedFoldFunction(x,y) {
		return foldFunction(y,x);
	}
	return this.reverse().scanl(flippedFoldFunction, initial);
};

/** Iterable.zip(iterables...):
	Returns an iterable that iterates over this and all the given iterables 
	at the same time; yielding an array of the values of each and stopping 
	at the first one finishing.
*/
Iterable.prototype.zip = function zip() {
	var its = Array.prototype.slice.call(arguments).map(iterable);
	its.unshift(this);
	return new Iterable(function __iter__() {
		var iterators = its.map(function (it) { 
			return it.__iter__(); 
		});
		return function __zipIterator__() {
			return iterators.map(function (iterator) { 
				return iterator();
			});
		};
	});
};

/** Iterable.sorted(sortFunction):
	Returns an iterable that goes through this iterable's elements in order.
	Warning! This iterable's elements are stored in an array for sorting.
*/
Iterable.prototype.sorted = function sorted(sortFunction) {
	return new Iterable(this.toArray().sort(sortFunction));
};

/** Iterable.cycle(n=Infinity):
	Returns an iterable that loops n times over the elements of this 
	Iterable (or forever by default).
*/
Iterable.prototype.cycle = function cycle(n) {
	n = n === undefined ? Infinity : (+n);
	var iterable = this; 
	return new Iterable(function __iter__() {
		var i = n, iter = iterable.__iter__();
		return function __cycleIterator__() {
			while (i > 0) try {
				return iter();
			} catch (err) {
				if (err === STOP_ITERATION && i > 1) {
					i--;
					iter = iterable.__iter__();
				} else {
					throw err;
				}
			}
			throw STOP_ITERATION; // In case n < 1.
		};
	});
};

/** Iterable.product(iterables...):
	Returns an iterable that iterates over the Cartesian product of this
	and all the given iterables; yielding an array of the values of each.
*/
Iterable.prototype.product = function product() {
	var its = Array.prototype.slice.call(arguments).map(iterable);
	its.unshift(this);
	return new Iterable(function __iter__() {
		var tuple, iterators = its.map(function (it) {
				return it.__iter__();
			});
		return function __productIterator__() {
			if (!tuple) { // First tuple.
				tuple = iterators.map(function (iter) {
					return iter(); // If STOP_ITERATION is raised, it should not be catched.
				});
			} else { // Subsequent tuples.
				for (var i = iterators.length-1; true; i--) {
					try {
						tuple[i] = iterators[i]();
						break;
					} catch (err) {
						if (i > 0 && err === STOP_ITERATION) {
							iterators[i] = its[i].__iter__();
							tuple[i] = iterators[i]();
						} else {
							throw err;
						}
					}
				}
			}
			return tuple.slice(0); // Shallow array clone.
		};
	});
};

/** Iterable.chain(iterables...):
	Returns an iterable that iterates over the concatenation of this and all 
	the given iterables.
*/
Iterable.prototype.chain = function chain() {
	var its = Array.prototype.slice.call(arguments).map(iterable);
	its.unshift(this);
	return new Iterable(function __iter__() {
		var i = 0, iterator = its[0].__iter__();
		return function __chainIterator__() {
			while (true) try {
				return iterator();
			} catch (err) { 
				if (err === STOP_ITERATION && i + 1 < its.length) {
					i++;
					iterator = its[i].__iter__();
				} else {
					throw err; // Rethrow if not STOP_ITERATION or there aren't more iterables.
				}
			}
			throw STOP_ITERATION;
		};
	});
};

/** Iterable.flatten():
	Chains all the iterables in the elements of this iterable.
*/
Iterable.prototype.flatten = function flatten() {
	var it = this.__iter__();
	return new Iterable(function __iter__() {
		var iterator = this.stop;
		return function __flattenIterator__() {
			while (true) try {
				return iterator();
			} catch (err) { 
				if (err === STOP_ITERATION) {
					iterator = iterable(it()).__iter__();
				}
			}
			throw STOP_ITERATION;
		};
	});
};	

/** Iterable.pluck(member):
	Shortcut for a map that extracts a member from the objects in the 
	sequence.
	Inspired by <http://underscorejs.org/#pluck>.
*/
Iterable.prototype.pluck = function pluck(member) {
	return this.map(function (obj) {
		return obj[member];
	});
};

/** Iterable.greater(evaluation=<cast to number>):
	Returns an array with the elements of the iterable with greater
	evaluation.
*/
Iterable.prototype.greater = function greater(evaluation) {
	evaluation = typeof evaluation === 'function' ? evaluation : function (x) {
			return +x;
		};
	var maxEval = -Infinity, result = [], e;
	this.forEach(function (x) {
		e = evaluation(x);
		if (maxEval < e) {
			maxEval = e;
			result = [x];
		} else if (maxEval == e) {
			result.push(x);
		}
	});
	return result;
};

/** Iterable.lesser(evaluation=<cast to number>):
	Returns an array with the elements of the iterable with lesser
	evaluation.
*/
Iterable.prototype.lesser = function lesser(evaluation) {
	evaluation = typeof evaluation === 'function' ? evaluation : function (x) {
			return +x;
		};
	var minEval = Infinity, result = [], e;
	this.forEach(function (x) {
		e = evaluation(x);
		if (minEval > e) {
			minEval = e;
			result = [x];
		} else if (minEval == e) {
			result.push(x);
		}
	});
	return result;
};

// Utility functions. //////////////////////////////////////////////////////////

/** Iterable.range(from=0, to, step=1):
	Builds an Iterable object with number from argument from upto argument to,
	with the given step. For example, basis.range(2,12,3) represents the 
	sequence {2, 5, 8, 11}.
*/
Iterable.range = function range(from, to, step) {
	switch (arguments.length) {
		case 0: from = 0; to = 0; step = 1; break;
		case 1: to = from; from = 0; step = 1; break;
		case 2: step = 1; break;
	}
	return new Iterable(function __iter__() {
		var i = from, r;
		return function __rangeIterator__() {
			if (isNaN(i) || isNaN(to) || i >= to) {
				throw STOP_ITERATION;
			} else {
				r = i;
				i = i + step;
				return r;
			}
		};
	});
};

/** Iterable.repeat(x, n=Infinity):
	Returns an iterable that repeats the element x n times (or forever by
	default).
*/
Iterable.repeat = function repeat(x, n) {
	n = isNaN(n) ? Infinity : +n;
	return new Iterable(function __iter__() {
		var i = n;
		return function __repeatIterator__() {
			i--;
			if (i < 0) {
				throw STOP_ITERATION;
			} else {
				return x;
			}
		};
	});
};

/** Iterable.iterate(f, x, n=Infinity):
	Returns an iterable that repeatedly applies the function f to the value
	x, n times (or indefinitely by default).
*/
Iterable.iterate = function iterate(f, x, n) {
	n = isNaN(n) ? Infinity : +n;
	return new Iterable(function __iter__() {
		var i = n, value = x;
		return function __iterateIterator__() {
			i--;
			if (i < 0) {
				throw STOP_ITERATION;
			} else {
				var result = value;
				value = f(value);
				return result;
			}
		};
	});
};