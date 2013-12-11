/** tests/test_basis.js:
	Test cases for the module <basis.js>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
define(['basis'], function (basis) { "use strict";
	var verifier = new basis.Verifier();
	
	verifier.test("basis.declare()", function () {
		this.assertIsFunction(basis.declare);
		var cons = (function () {});
		this.assertUndefined(cons.prototype.x);
		this.assertUndefined(cons.prototype.y);
		var class1 = basis.declare({ 
			constructor: cons,
			x: 1,
			y: "a"
		})
		this.assertSame(cons, class1);
		this.assertEqual(1, class1.prototype.x);
		this.assertEqual("a", class1.prototype.y);
	// Inheritance.
		var class2a = basis.declare(class1, {
			z: 2.2
		});
		this.assertNotSame(cons, class2a);
		this.assertEqual(1, class2a.prototype.x);
		this.assertEqual("a", class2a.prototype.y);
		this.assertEqual(2.2, class2a.prototype.z);
		this.assertInstanceOf(class1, new class2a());
		var cons2 = (function () { this.x = 11; }),
			class2b = basis.declare(class1, class2a, {
				constructor: cons2
			});
		this.assertSame(cons2, class2b);
		this.assertEqual(1, class2b.prototype.x);
		this.assertEqual("a", class2b.prototype.y);
		this.assertEqual(2.2, class2b.prototype.z);
		this.assertInstanceOf(class1, new class2b());
	});
	
	verifier.test("basis.obj()", function () {
		this.assertIsFunction(basis.obj);
		this.assertIsArray([], Object.keys(basis.obj()));
		var o = basis.obj('a', 1);
		this.assertEqual(1, o.a);
		o = basis.obj('b', 2, 'c', 3);
		this.assertEqual(2, o.b);
		this.assertEqual(3, o.c);
		o = basis.obj(true, 4, 12, 5);
		this.assertEqual(4, o['true']);
		this.assertEqual(5, o['12']);
	});
	
	verifier.todo("basis.copy()");
	verifier.todo("basis.raise()");
	verifier.todo("basis.raiseIf()");
	verifier.todo("basis.callStack()");
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});