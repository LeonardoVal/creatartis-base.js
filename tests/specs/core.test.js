define(['creatartis-base'], function (base) { "use strict";
	describe("Core", function () {
		it("creatartis-base.declare()", function () {
			var cons = (function () {}),
				cons2 = (function () { this.x = 11; });
			expect(typeof base.declare).toBe("function");
			expect(cons.prototype.x).toBeUndefined();
			expect(cons.prototype.y).toBeUndefined();

			var Class1 = base.declare({ constructor: cons, x: 1, y: "a" });
			expect(Class1).toBe(cons);
			expect(Class1.prototype.x).toBe(1);
			expect(Class1.prototype.y).toBe("a");

			var Class2a = base.declare(Class1, { z: 2.2 });
			expect(Class2a).not.toBe(cons);
			expect(Class2a.prototype.x).toBe(1);
			expect(Class2a.prototype.y).toBe("a");
			expect(Class2a.prototype.z).toBe(2.2);
			expect(new Class2a()).toBeOfType(Class1);

			var Class2b = base.declare(Class1, Class2a, { constructor: cons2 });
			expect(Class2b).toBe(cons2);
			expect(Class2b.prototype.x).toBe(1);
			expect(Class2b.prototype.y).toBe("a");
			expect(Class2b.prototype.z).toBe(2.2);
			expect(new Class2b()).toBeOfType(Class1);
		});

		it("creatartis-base.obj()", function () {
			expect(typeof base.obj).toBe('function');
			expect(Object.keys(base.obj()).length).toBe(0);
			var obj = base.obj('a', 1);
			expect(obj.a).toBe(1);
			obj = base.obj('b', 2, 'c', 3);
			expect(obj.b).toBe(2);
			expect(obj.c).toBe(3);
			obj = base.obj(true, 4, 12, 5);
			expect(obj['true']).toBe(4);
			expect(obj['12']).toBe(5);
		});
	}); //// describe.
}); //// define.
