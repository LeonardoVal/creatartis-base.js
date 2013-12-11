/** tests/test_iterables.js:
	Test cases for the module <src/iterables.js>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis'], function (basis) { "use strict";
	var verifier = new basis.Verifier(),
		Iterable = basis.Iterable,
		iterable = basis.iterable;
	
	function assertSequence(it) { // Used mainly to test iterables.
		var iterator = it.__iter__(), x;
		for (var i = 1; i < arguments.length; i++) {
			x = verifier.assertSucceeds(iterator);
			verifier.assertEqual(JSON.stringify(arguments[i]), JSON.stringify(x));
		}
		var stop = verifier.assertFails(iterator);
		verifier.assertEqual(Iterable.STOP_ITERATION, stop);
	}
	
// Test cases //////////////////////////////////////////////////////////////////
	
	verifier.test("Iterable (module definitions)", function () {
		verifier.assertIsFunction(Iterable, "basis.Iterable is not a function.");
		verifier.assertIsFunction(iterable, "basis.iterable is not a function.");
		verifier.assertInstanceOf(Error, Iterable.STOP_ITERATION, "basis.Iterable.STOP_ITERATION is not an Error.");
	});
	
	verifier.test("Iterable (constructors)", function () {
	// Iterable from array.
		assertSequence(new Iterable([0,1,2]), 0, 1, 2);
		assertSequence(new Iterable([true]), true);
		assertSequence(new Iterable([]));
	// Iterable from string.
		assertSequence(new Iterable('abc'), 'a', 'b', 'c');
		assertSequence(new Iterable('0'), '0');
		assertSequence(new Iterable(''));
	// Iterable from object.
		assertSequence(new Iterable({x:1, y:2}), ['x',1], ['y',2]);
		assertSequence(new Iterable({z:0}), ['z',0]);
		assertSequence(new Iterable({}));
	// Iterable from value.
		assertSequence(new Iterable(1), 1);
		verifier.assertFails(function () { new Iterable(); });
		verifier.assertFails(function () { new Iterable(null); });
	});
	
	verifier.test("Iterable.range()", function () {
		verifier.assertIsFunction(Iterable.range, "basis.Iterable.range is not a function.");
		assertSequence(Iterable.range(3), 0, 1, 2);
		assertSequence(Iterable.range(0, 3), 0, 1, 2);
		assertSequence(Iterable.range(0, 3, 1), 0, 1, 2);
		assertSequence(Iterable.range(1), 0);
		assertSequence(Iterable.range(0, 1), 0);
		assertSequence(Iterable.range(0, 1, 1), 0);
		assertSequence(Iterable.range());
		assertSequence(Iterable.range(0));
		assertSequence(Iterable.range(0, 0));
		assertSequence(Iterable.range(1, 0));
		assertSequence(Iterable.range(0, 10, 3), 0, 3, 6, 9);
		assertSequence(Iterable.range(1, 10, 3), 1, 4, 7);
	});
	
	verifier.test("Iterable.repeat()", function () {
		verifier.assertIsFunction(Iterable.repeat, "basis.Iterable.repeat is not a function.");
		assertSequence(Iterable.repeat(1, 5), 1, 1, 1, 1, 1);
		assertSequence(Iterable.repeat(1, 0));
	});
	
	verifier.test("Iterable.iterate()", function () {
		verifier.assertIsFunction(Iterable.iterate, "basis.Iterable.iterate is not a function.");
		function f1(x) { 
			return x*2; 
		}
		assertSequence(Iterable.iterate(f1, 1, 6), 1, 2, 4, 8, 16, 32);
		assertSequence(Iterable.iterate(f1, 1, 1), 1);
		assertSequence(Iterable.iterate(f1, 1, 0));
	});
	
	verifier.todo("Iterable.forEach()");
	
	verifier.test("Iterable.toArray()", function toArray() {
		var it = Iterable.range(0,4);
		verifier.assertIsFunction(it.toArray, "Iterable.toArray() is not a function.");
		var array1 = it.toArray();
		verifier.assert(Array.isArray(array1), "Iterable.toArray() returned ", array1, ' which is not an array.');
		assertSequence(iterable(array1), 0, 1, 2, 3);
		array1 = Iterable.range(0,0).toArray()
		verifier.assert(Array.isArray(array1), "Iterable.toArray() returned ", array1, ' which is not an array.');
		verifier.assertFalse(array1.length, "Iterable.toArray() return a non empty array (", array1, ") for an empty sequence.");
	});
	
	verifier.test("Iterable.count()", function () {
		verifier.assertEqual(6, Iterable.range(1, 7).count());
		verifier.assertEqual(3, Iterable.range(1, 4).count());
		verifier.assertEqual(1, Iterable.range(1, 2).count());
		verifier.assertEqual(0, Iterable.range(1, 1).count());
		verifier.assertEqual(6, iterable('abcdef').count());
		verifier.assertEqual(1, iterable('a').count());
		verifier.assertEqual(0, iterable('').count());
		verifier.assertEqual(4, iterable([0,1,2,3]).count());
		verifier.assertEqual(1, iterable([0]).count());
		verifier.assertEqual(0, iterable([]).count());
	});
	
	verifier.test("Iterable.join()", function () {
		verifier.assertEqual('1,2,3', Iterable.range(1, 4).join(','));
		verifier.assertEqual('a.b.c', iterable('abc').join('.'));
		verifier.assertEqual('abc', iterable('abc').join(''));
		verifier.assertEqual('abc', iterable('abc').join());
		verifier.assertEqual('1', Iterable.range(1, 2).join(','));
		verifier.assertEqual('', Iterable.range().join(','));
	});
	
	verifier.test("Iterable.sum()", function () {
		verifier.assertEqual(6, Iterable.range(1, 4).sum());
		verifier.assertEqual(1, Iterable.range(1, 2).sum());
		verifier.assertEqual(0, Iterable.range().sum());
		verifier.assertEqual(7, Iterable.range().sum(7));
	});
	
	verifier.test("Iterable.min()", function () {
		verifier.assertEqual(1, Iterable.range(1, 4).min());
		verifier.assertEqual(2, Iterable.range(2, 3).min());
		verifier.assertEqual(Infinity, Iterable.range(2, 2).min());
		verifier.assertEqual(1, Iterable.range(2, 2).min(1));
	});
	
	verifier.test("Iterable.max()", function () {
		verifier.assertEqual(3, Iterable.range(1, 4).max());
		verifier.assertEqual(2, Iterable.range(2, 3).max());
		verifier.assertEqual(-Infinity, Iterable.range(2, 2).max());
		verifier.assertEqual(1, Iterable.range(2, 2).max(1));
	});
	
	verifier.test("Iterable.reverse()", function reverse() {
		verifier.assertEqual('fedcba', iterable('abcdef').reverse().join(''));
		verifier.assertEqual('a', iterable('a').reverse().join(''));
		verifier.assertEqual('', iterable('').reverse().join(''));
	});
	
	verifier.test("Iterable.cycle()", function () {
		verifier.assertEqual('ababab', iterable('ab').cycle(3).join(''));
		verifier.assertEqual('ab', iterable('ab').cycle(1).join(''));	
		verifier.assertEqual('', iterable('ab').cycle(0).join(''));	
		verifier.assertEqual('', iterable('').cycle(3).join(''));
	});

	verifier.test("Iterable.chain()", function () {
		assertSequence(Iterable.range(1,4).chain(Iterable.range(1,3)), 1, 2, 3, 1, 2);
		assertSequence(Iterable.range(1,4).chain(Iterable.range()), 1, 2, 3);
		assertSequence(Iterable.range().chain(Iterable.range(1,4)), 1, 2, 3);
		assertSequence(Iterable.range().chain(Iterable.range()));
		assertSequence(iterable('ab').chain('xy', 'pq'), 'a', 'b', 'x', 'y', 'p', 'q');
	});
	
	verifier.test("Iterable.flatten()", function () {
		assertSequence(iterable([]).flatten());
		assertSequence(iterable([[]]).flatten());
		assertSequence(iterable([[],[]]).flatten());
		assertSequence(iterable([[1]]).flatten(), 1);
		assertSequence(iterable([[1], []]).flatten(), 1);
		assertSequence(iterable([[], [1]]).flatten(), 1);
		assertSequence(iterable([[1], [2]]).flatten(), 1, 2);
		assertSequence(iterable([[1,2],[3,4]]).flatten(), 1, 2, 3, 4);
		assertSequence(iterable([1]).flatten(), 1);
		assertSequence(iterable([1, 2]).flatten(), 1, 2);
	});
	
	verifier.test("Iterable.all()", function () {
		var range1 = Iterable.range(1,4), 
			emptyRange = Iterable.range(0,0);
		verifier.assert(range1.all());
		verifier.assertFalse(range1.all(function (x) { return !x; }));
		verifier.assertFalse(range1.all(function (x) { return x > 2; }));
		verifier.assert(emptyRange.all());
	});
	
	verifier.test("Iterable.any()", function () {
		var range1 = Iterable.range(1,4), 
			emptyRange = Iterable.range(0,0);
		verifier.assert(range1.any());
		verifier.assertFalse(range1.any(function (x) { return !x; }));
		verifier.assert(range1.any(function (x) { return x > 2; }));
		verifier.assertFalse(emptyRange.any());		
	});
	
	verifier.test("Iterable.map()", function () {
		function mapFun(str) {
			return str.toUpperCase();
		}
		function filterFun(str) {
			return !!(/\D/.test(str));
		}
		assertSequence(iterable('').map(mapFun));
		assertSequence(iterable('a1b').map(mapFun), 'A', '1', 'B');
		assertSequence(iterable('a1b').map(mapFun, filterFun), 'A', 'B');
		
		function mapFun2(c, n) { 
			return c + n; 
		}
		assertSequence(iterable('xyz').map(mapFun2), 'x0', 'y1', 'z2');
	});

	verifier.test("Iterable.filter()", function () {
		function mapFun(str) {
			return str.toUpperCase();
		}
		function filterFun(str) {
			return !!(/\D/.test(str));
		}
		assertSequence(iterable('').filter(filterFun));
		assertSequence(iterable('a1b').filter(filterFun), 'a', 'b');
		assertSequence(iterable('a1b').filter(filterFun, mapFun), 'A', 'B');
		
		function mapFun2(c, n) { 
			return c + n; 
		}
		assertSequence(iterable('a1b').filter(filterFun, mapFun2), 'a0', 'b2');
	});
	
	verifier.test("Iterable.foldl()", function () {
		verifier.assertEqual(6, Iterable.range(7).foldl(Math.max));
		verifier.assertEqual(8, Iterable.range(7).foldl(Math.max, 8));
		verifier.assertEqual(8, Iterable.range().foldl(Math.max, 8));
	});
	
	verifier.test("Iterable.scanl()", function () {
		assertSequence(iterable([1,2,0,3]).scanl(Math.max), 1, 2, 2, 3);
		assertSequence(iterable([1,2,0,3]).scanl(Math.max, -Infinity), -Infinity, 1, 2, 2, 3);
		assertSequence(iterable([]).scanl(Math.max, -Infinity), -Infinity);
		assertSequence(iterable([]).scanl(Math.max));
	});
	
	verifier.test("Iterable.foldr()", function () {
		function foldFun(x, y) {
			return Math.pow(x, y);
		}
		verifier.assertEqual(256, iterable([2,2,3]).foldr(foldFun));
		verifier.assertEqual(256, iterable([2,2]).foldr(foldFun, 3));
		verifier.assertEqual(2, iterable([2]).foldr(foldFun));
		verifier.assertEqual(4, iterable([2]).foldr(foldFun, 2));
		verifier.assertEqual(2, iterable([]).foldr(foldFun, 2));
	});
	
	verifier.test("Iterable.scanr()", function () {
		function foldFun(x, y) {
			return Math.pow(x, y);
		}
		assertSequence(iterable([2,2,3]).scanr(foldFun), 3, 8, 256);
		assertSequence(iterable([2,2]).scanr(foldFun, 3), 3, 8, 256);
		assertSequence(iterable([]).scanr(foldFun, 3), 3);
		assertSequence(iterable([]).scanr(foldFun));
	});

	verifier.test("Iterable.head()", function () {
		var empty = iterable([]);
		this.assertFails(empty.head.bind(empty));
		this.assertEqual(17, empty.head(17));
		empty = iterable([false]).filter();
		this.assertFails(empty.head.bind(empty));
		this.assertEqual(17, empty.head(17));
		this.assertEqual(1, iterable([1,2,3]).head());
		this.assertEqual('a', iterable('abc').head());
	});
	
	verifier.test("Iterable.last()", function () {
		var empty = iterable([]);
		this.assertFails(empty.last.bind(empty));
		this.assertEqual(17, empty.last(17));
		empty = iterable([false]).filter();
		this.assertFails(empty.last.bind(empty));
		this.assertEqual(17, empty.last(17));
		this.assertEqual(3, iterable([1,2,3]).last());
		this.assertEqual('c', iterable('abc').last());
	});
	
	verifier.test("Iterable.zip()", function () {
		assertSequence(iterable('abc').zip('xyz'), ['a','x'], ['b','y'], ['c','z']);
		assertSequence(iterable('abc').zip('x'), ['a','x']);
		assertSequence(iterable('a').zip('xyz'), ['a','x']);
		assertSequence(iterable('').zip('xyz'));
		assertSequence(iterable('abc').zip(''));
	});

	verifier.test("Iterable.product()", function () {
		assertSequence(iterable('01').product('ab'), ['0','a'], ['0','b'], ['1','a'], ['1','b']);
		assertSequence(iterable('012').product('ab'), ['0','a'], ['0','b'], ['1','a'], ['1','b'], ['2','a'], ['2','b']);
		assertSequence(iterable('01').product('abc'), ['0','a'], ['0','b'], ['0','c'], ['1','a'], ['1','b'], ['1','c']);
		assertSequence(iterable('0').product('ab'), ['0','a'], ['0','b']);
		assertSequence(iterable('01').product('a'), ['0','a'], ['1','a']);
		assertSequence(iterable('01').product(''));
		assertSequence(iterable('').product('ab'));
		assertSequence(iterable('').product(''));
	});
	
	verifier.test("Iterable.sorted()", function () {
		assertSequence(iterable([0, 1, 2]).sorted(), 0, 1, 2);
		assertSequence(iterable([2, 1, 0]).sorted(), 0, 1, 2);
		assertSequence(iterable([0, 2, 1]).sorted(), 0, 1, 2);
		assertSequence(iterable([]).sorted());
		assertSequence(iterable('abcdef').sorted(), 'a', 'b', 'c', 'd', 'e', 'f');
		assertSequence(iterable('fedcba').sorted(), 'a', 'b', 'c', 'd', 'e', 'f');
		assertSequence(iterable('defabc').sorted(), 'a', 'b', 'c', 'd', 'e', 'f');
		assertSequence(iterable('').sorted());
	});
	
	verifier.test("Iterable.greater()", function () {
		function evaluation(x) {
			return x % 3;
		}
		assertSequence(iterable(iterable([]).greater(evaluation)));
		assertSequence(iterable(iterable([1]).greater(evaluation)), 1);
		assertSequence(iterable(iterable([1,1,1]).greater(evaluation)), 1, 1, 1);
		assertSequence(iterable(iterable([0,1,2]).greater(evaluation)), 2);
		assertSequence(iterable(iterable([1,4,7]).greater(evaluation)), 1, 4, 7);
		assertSequence(iterable(iterable([0,1,2,3,4,5,6]).greater(evaluation)), 2, 5);
	});
	
	verifier.test("Iterable.lesser()", function () {
		function evaluation(x) {
			return x % 3;
		}
		assertSequence(iterable(iterable([]).lesser(evaluation)));
		assertSequence(iterable(iterable([1]).lesser(evaluation)), 1);
		assertSequence(iterable(iterable([1,1,1]).lesser(evaluation)), 1, 1, 1);
		assertSequence(iterable(iterable([0,1,2]).lesser(evaluation)), 0);
		assertSequence(iterable(iterable([1,4,7]).lesser(evaluation)), 1, 4, 7);
		assertSequence(iterable(iterable([0,1,2,3,4,5,6]).lesser(evaluation)), 0, 3, 6);
	});

/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});