define(['basis'], function (basis) { "use strict";
	describe("Core", function () {
		it("basis.declare()", function () {
			var cons = (function () {}),
				cons2 = (function () { this.x = 11; });
			expect(typeof basis.declare).toBe("function");
			expect(cons.prototype.x).toBeUndefined();
			expect(cons.prototype.y).toBeUndefined();
			
			var class1 = basis.declare({ constructor: cons, x: 1, y: "a" });
			expect(class1).toBe(cons);
			expect(class1.prototype.x).toBe(1);
			expect(class1.prototype.y).toBe("a");

			var class2a = basis.declare(class1, { z: 2.2 });
			expect(class2a).not.toBe(cons);
			expect(class2a.prototype.x).toBe(1);
			expect(class2a.prototype.y).toBe("a");
			expect(class2a.prototype.z).toBe(2.2);
			expect(new class2a()).toBeOfType(class1);
			
			var class2b = basis.declare(class1, class2a, { constructor: cons2 });
			expect(class2b).toBe(cons2);
			expect(class2b.prototype.x).toBe(1);
			expect(class2b.prototype.y).toBe("a");
			expect(class2b.prototype.z).toBe(2.2);
			expect(new class2b()).toBeOfType(class1);
		});

		it("basis.obj()", function () {
			expect(typeof basis.obj).toBe('function');
			expect(Object.keys(basis.obj()).length).toBe(0);
			var obj = basis.obj('a', 1);
			expect(obj.a).toBe(1);
			obj = basis.obj('b', 2, 'c', 3);
			expect(obj.b).toBe(2);
			expect(obj.c).toBe(3);
			obj = basis.obj(true, 4, 12, 5);
			expect(obj['true']).toBe(4);
			expect(obj['12']).toBe(5);
		});
	}); //// describe.
}); //// define.