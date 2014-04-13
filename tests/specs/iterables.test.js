define(['basis'], function (basis) { "use strict";
	var Iterable = basis.Iterable,
		iterable = basis.iterable;
	
	function expectSequence(sequence) { // Used mainly to test iterables.
		var iterator = sequence.__iter__(), x;
		for (var i = 1; i < arguments.length; ++i) {
			expect(iterator()).toEqual(arguments[i]);
		}
		expect(iterator).toThrow(Iterable.STOP_ITERATION);
	}
	
	describe("Iterables", function () {
		it("module definitions", function () {
			expect(Iterable).toBeOfType('function');
			expect(iterable).toBeOfType('function');
			expect(Iterable.STOP_ITERATION).toBeOfType(Error);
		});
	
		it("constructors", function () {
			expectSequence(new Iterable([0,1,2]), 0, 1, 2); // arrays
			expectSequence(new Iterable([true]), true);
			expectSequence(new Iterable([]));
			expectSequence(new Iterable('abc'), 'a', 'b', 'c'); // strings
			expectSequence(new Iterable('0'), '0');
			expectSequence(new Iterable(''));
			expectSequence(new Iterable({x:1, y:2}), ['x',1], ['y',2]); // objects
			expectSequence(new Iterable({z:0}), ['z',0]);
			expectSequence(new Iterable({}));
			expectSequence(new Iterable(1), 1); // singletons.
			expect(function () { new Iterable(); }).toThrow();
			expect(function () { new Iterable(null); }).toThrow();
		});
	
	// Sequence information. ///////////////////////////////////////////////////
		it("isEmpty()", function () {
			expect(new Iterable([]).isEmpty()).toBe(true);
			expect(new Iterable([1, 2, 3]).isEmpty()).toBe(false);
			expect(new Iterable([true]).isEmpty()).toBe(false);
		});
		
		it("count()", function () {
			expect(Iterable.range(1, 7).count()).toBe(6);
			expect(Iterable.range(1, 4).count()).toBe(3);
			expect(Iterable.range(1, 2).count()).toBe(1);
			expect(Iterable.range(1, 1).count()).toBe(0);
			expect(iterable('abcdef').count()).toBe(6);
			expect(iterable('a').count()).toBe(1);
			expect(iterable('').count()).toBe(0);
			expect(iterable([0,1,2,3]).count()).toBe(4);
			expect(iterable([0]).count()).toBe(1);
			expect(iterable([]).count()).toBe(0);
		});
		
	// Sequence iteration. /////////////////////////////////////////////////////
		it("forEach()", function () {
			var array1 = [1, false, 2.2, 'a'], current = 0;
			expect(iterable(array1).forEach(function (x, i) {
				expect(i).toBe(current);
				expect(x).toBe(array1[i]);
				current++;
				return x;
			})).toBe(array1[array1.length - 1]);
			expect(iterable([]).forEach(function () {
				throw new Error('This should not have executed!');
			})).toBeUndefined();
		});

		it("map()", function () {
			function mapFun(str) {
				return str.toUpperCase();
			}
			function filterFun(str) {
				return !!(/\D/.test(str));
			}
			expectSequence(iterable('').map(mapFun));
			expectSequence(iterable('a1b').map(mapFun), 'A', '1', 'B');
			expectSequence(iterable('a1b').map(mapFun, filterFun), 'A', 'B');
			
			function mapFun2(c, n) { 
				return c + n; 
			}
			expectSequence(iterable('xyz').map(mapFun2), 'x0', 'y1', 'z2');
		});
		
		it("mapApply()", function () {
			function mapFun(x, y) {
				return x * y;
			}
			function filterFun(x) {
				return x < 20;
			}
			var sequence = iterable([[1,2], [4,4], [6,5]]);
			expectSequence(sequence.mapApply(mapFun), 2, 16, 30);
			expectSequence(sequence.mapApply(mapFun, filterFun), 2, 16);
		});
	
	// Filter and selection. ///////////////////////////////////////////////////
		it("filter()", function () {
			function mapFun(str) {
				return str.toUpperCase();
			}
			function filterFun(str) {
				return !!(/\D/.test(str));
			}
			expectSequence(iterable('').filter(filterFun));
			expectSequence(iterable('a1b').filter(filterFun), 'a', 'b');
			expectSequence(iterable('a1b').filter(filterFun, mapFun), 'A', 'B');
			
			function mapFun2(c, n) { 
				return c + n; 
			}
			expectSequence(iterable('a1b').filter(filterFun, mapFun2), 'a0', 'b2');
		});

		it("filterApply()", function () {
			function filterFun(x, y) {
				return x < y;
			}
			function mapFun(x, y) {
				return x * y;
			}
			var sequence = iterable([[1,2], [4,4], [7,8], [6,5]]);
			expectSequence(sequence.filterApply(filterFun).mapApply(mapFun), 2, 56);
			expectSequence(sequence.filterApply(filterFun, mapFun), 2, 56);
		});
		
		it("head()", function () {
			var empty = iterable([]);
			expect(empty.head.bind(empty)).toThrow();
			expect(empty.head(17)).toBe(17);
			empty = iterable([false]).filter();
			expect(empty.head.bind(empty)).toThrow();
			expect(empty.head(17)).toBe(17);
			expect(iterable([1,2,3]).head()).toBe(1);
			expect(iterable('abc').head()).toBe('a');
		});
		
		it("last()", function () {
			var empty = iterable([]);
			expect(empty.last.bind(empty)).toThrow();
			expect(empty.last(17)).toBe(17);
			empty = iterable([false]).filter();
			expect(empty.last.bind(empty)).toThrow();
			expect(empty.last(17)).toBe(17);
			expect(iterable([1,2,3]).last()).toBe(3);
			expect(iterable('abc').last()).toBe('c');
		});
	
		it("greater()", function () {
			function evaluation(x) {
				return x % 3;
			}
			expectSequence(iterable(iterable([]).greater(evaluation)));
			expectSequence(iterable(iterable([1]).greater(evaluation)), 1);
			expectSequence(iterable(iterable([1,1,1]).greater(evaluation)), 1, 1, 1);
			expectSequence(iterable(iterable([0,1,2]).greater(evaluation)), 2);
			expectSequence(iterable(iterable([1,4,7]).greater(evaluation)), 1, 4, 7);
			expectSequence(iterable(iterable([0,1,2,3,4,5,6]).greater(evaluation)), 2, 5);
		});
		
		it("lesser()", function () {
			function evaluation(x) {
				return x % 3;
			}
			expectSequence(iterable(iterable([]).lesser(evaluation)));
			expectSequence(iterable(iterable([1]).lesser(evaluation)), 1);
			expectSequence(iterable(iterable([1,1,1]).lesser(evaluation)), 1, 1, 1);
			expectSequence(iterable(iterable([0,1,2]).lesser(evaluation)), 0);
			expectSequence(iterable(iterable([1,4,7]).lesser(evaluation)), 1, 4, 7);
			expectSequence(iterable(iterable([0,1,2,3,4,5,6]).lesser(evaluation)), 0, 3, 6);
		});
	
	// Aggregations. ///////////////////////////////////////////////////////////
		it("foldl()", function () {
			expect(Iterable.range(7).foldl(Math.max)).toBe(6);
			expect(Iterable.range(7).foldl(Math.max, 8)).toBe(8);
			expect(Iterable.range().foldl(Math.max, 8)).toBe(8);
		});
		
		it("scanl()", function () {
			expectSequence(iterable([1,2,0,3]).scanl(Math.max), 1, 2, 2, 3);
			expectSequence(iterable([1,2,0,3]).scanl(Math.max, -Infinity), -Infinity, 1, 2, 2, 3);
			expectSequence(iterable([]).scanl(Math.max, -Infinity), -Infinity);
			expectSequence(iterable([]).scanl(Math.max));
		});
		
		it("foldr()", function () {
			function foldFun(x, y) {
				return Math.pow(x, y);
			}
			expect(iterable([2,2,3]).foldr(foldFun)).toBe(256);
			expect(iterable([2,2]).foldr(foldFun, 3)).toBe(256);
			expect(iterable([2]).foldr(foldFun)).toBe(2);
			expect(iterable([2]).foldr(foldFun, 2)).toBe(4);
			expect(iterable([]).foldr(foldFun, 2)).toBe(2);
		});
		
		it("scanr()", function () {
			function foldFun(x, y) {
				return Math.pow(x, y);
			}
			expectSequence(iterable([2,2,3]).scanr(foldFun), 3, 8, 256);
			expectSequence(iterable([2,2]).scanr(foldFun, 3), 3, 8, 256);
			expectSequence(iterable([]).scanr(foldFun, 3), 3);
			expectSequence(iterable([]).scanr(foldFun));
		});
	
		it("sum()", function () {
			expect(Iterable.range(1, 4).sum()).toBe(6);
			expect(Iterable.range(1, 2).sum()).toBe(1);
			expect(Iterable.range().sum()).toBe(0);
			expect(Iterable.range().sum(7)).toBe(7);
		});
	
		it("min()", function () {
			expect(Iterable.range(1, 4).min()).toBe(1);
			expect(Iterable.range(2, 3).min()).toBe(2);
			expect(Iterable.range(2, 2).min()).toBe(Infinity);
			expect(Iterable.range(2, 2).min(1)).toBe(1);
		});
	
		it("max()", function () {
			expect(Iterable.range(1, 4).max()).toBe(3);
			expect(Iterable.range(2, 3).max()).toBe(2);
			expect(Iterable.range(2, 2).max()).toBe(-Infinity);
			expect(Iterable.range(2, 2).max(1)).toBe(1);
		});
	
		it("all() && any()", function () {
			var range1 = Iterable.range(1,4), 
				emptyRange = Iterable.range(0,0);
			expect(range1.all()).toBe(true);
			expect(range1.all(function (x) { return !x; })).toBe(false);
			expect(range1.all(function (x) { return x > 2; })).toBe(false);
			expect(emptyRange.all()).toBe(true);

			expect(range1.any()).toBe(true);
			expect(range1.any(function (x) { return !x; })).toBe(false);
			expect(range1.any(function (x) { return x > 2; })).toBe(true);
			expect(emptyRange.any()).toBe(false);
		});
	
	// Sequence conversions. ///////////////////////////////////////////////////
		it("toArray()", function toArray() {
			var it = Iterable.range(0,4);
			expect(it.toArray).toBeOfType('function');
			var array1 = it.toArray();
			expect(Array.isArray(array1)).toBe(true);
			expectSequence(iterable(array1), 0, 1, 2, 3);
			array1 = Iterable.range(0,0).toArray();
			expect(Array.isArray(array1)).toBe(true);
			expect(array1.length).toBe(0);
		});
	
		it("join()", function () {
			expect(Iterable.range(1, 4).join(',')).toBe('1,2,3');
			expect(iterable('abc').join('.')).toBe('a.b.c');
			expect(iterable('abc').join('')).toBe('abc');
			expect(iterable('abc').join()).toBe('abc');
			expect(Iterable.range(1, 2).join(',')).toBe('1');
			expect(Iterable.range().join(',')).toBe('');
		});

	// Whole sequence operations. //////////////////////////////////////////////
		it("reverse()", function reverse() {
			expect(iterable('abcdef').reverse().join('')).toBe('fedcba');
			expect(iterable('a').reverse().join('')).toBe('a');
			expect(iterable('').reverse().join('')).toBe('');
		});
	
		it("sorted()", function () {
			expectSequence(iterable([0, 1, 2]).sorted(), 0, 1, 2);
			expectSequence(iterable([2, 1, 0]).sorted(), 0, 1, 2);
			expectSequence(iterable([0, 2, 1]).sorted(), 0, 1, 2);
			expectSequence(iterable([]).sorted());
			expectSequence(iterable('abcdef').sorted(), 'a', 'b', 'c', 'd', 'e', 'f');
			expectSequence(iterable('fedcba').sorted(), 'a', 'b', 'c', 'd', 'e', 'f');
			expectSequence(iterable('defabc').sorted(), 'a', 'b', 'c', 'd', 'e', 'f');
			expectSequence(iterable('').sorted());
		});
	
	// Operations on many sequences. ///////////////////////////////////////////
	
		it("zip()", function () {
			expectSequence(iterable('abc').zip('xyz'), ['a','x'], ['b','y'], ['c','z']);
			expectSequence(iterable('abc').zip('x'), ['a','x']);
			expectSequence(iterable('a').zip('xyz'), ['a','x']);
			expectSequence(iterable('').zip('xyz'));
			expectSequence(iterable('abc').zip(''));
		});

		it("product()", function () {
			expectSequence(iterable('01').product('ab'), ['0','a'], ['0','b'], ['1','a'], ['1','b']);
			expectSequence(iterable('012').product('ab'), ['0','a'], ['0','b'], ['1','a'], ['1','b'], ['2','a'], ['2','b']);
			expectSequence(iterable('01').product('abc'), ['0','a'], ['0','b'], ['0','c'], ['1','a'], ['1','b'], ['1','c']);
			expectSequence(iterable('0').product('ab'), ['0','a'], ['0','b']);
			expectSequence(iterable('01').product('a'), ['0','a'], ['1','a']);
			expectSequence(iterable('01').product(''));
			expectSequence(iterable('').product('ab'));
			expectSequence(iterable('').product(''));
		});
	
		it("chain()", function () {
			expectSequence(Iterable.range(1,4).chain(Iterable.range(1,3)), 1, 2, 3, 1, 2);
			expectSequence(Iterable.range(1,4).chain(Iterable.range()), 1, 2, 3);
			expectSequence(Iterable.range().chain(Iterable.range(1,4)), 1, 2, 3);
			expectSequence(Iterable.range().chain(Iterable.range()));
			expectSequence(iterable('ab').chain('xy', 'pq'), 'a', 'b', 'x', 'y', 'p', 'q');
		});
	
		it("flatten()", function () {
			expectSequence(iterable([]).flatten());
			expectSequence(iterable([[]]).flatten());
			expectSequence(iterable([[],[]]).flatten());
			expectSequence(iterable([[1]]).flatten(), 1);
			expectSequence(iterable([[1], []]).flatten(), 1);
			expectSequence(iterable([[], [1]]).flatten(), 1);
			expectSequence(iterable([[1], [2]]).flatten(), 1, 2);
			expectSequence(iterable([[1,2],[3,4]]).flatten(), 1, 2, 3, 4);
			expectSequence(iterable([1]).flatten(), 1);
			expectSequence(iterable([1, 2]).flatten(), 1, 2);
		});
	
	// Sequence builders. //////////////////////////////////////////////////////
		it("range()", function () {
			expect(Iterable.range).toBeOfType('function');
			expectSequence(Iterable.range(3), 0, 1, 2);
			expectSequence(Iterable.range(0, 3), 0, 1, 2);
			expectSequence(Iterable.range(0, 3, 1), 0, 1, 2);
			expectSequence(Iterable.range(1), 0);
			expectSequence(Iterable.range(0, 1), 0);
			expectSequence(Iterable.range(0, 1, 1), 0);
			expectSequence(Iterable.range());
			expectSequence(Iterable.range(0));
			expectSequence(Iterable.range(0, 0));
			expectSequence(Iterable.range(1, 0));
			expectSequence(Iterable.range(0, 10, 3), 0, 3, 6, 9);
			expectSequence(Iterable.range(1, 10, 3), 1, 4, 7);
		});
	
		it("repeat()", function () {
			expect(Iterable.repeat).toBeOfType('function');
			expectSequence(Iterable.repeat(1, 5), 1, 1, 1, 1, 1);
			expectSequence(Iterable.repeat(1, 0));
		});
	
		it("iterate()", function () {
			expect(Iterable.iterate).toBeOfType('function');
			function f1(x) { 
				return x*2; 
			}
			expectSequence(Iterable.iterate(f1, 1, 6), 1, 2, 4, 8, 16, 32);
			expectSequence(Iterable.iterate(f1, 1, 1), 1);
			expectSequence(Iterable.iterate(f1, 1, 0));
		});

		it("cycle()", function () {
			expect(iterable('ab').cycle(3).join('')).toBe('ababab');
			expect(iterable('ab').cycle(1).join('')).toBe('ab');	
			expect(iterable('ab').cycle(0).join('')).toBe('');	
			expect(iterable('').cycle(3).join('')).toBe('');
		});		
	}); // describe "Iterables"
}); //// define