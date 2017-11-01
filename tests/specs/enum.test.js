define(['creatartis-base'], function (base) { "use strict";
	describe("Enum", function () {
		it("creatartis-base.enum()", function () {
			[
				['a'],
				['x', 'y'],
				['p0', 'p1', 'p2']
			].forEach(function (keys) {
				var enum1 = base.enum(keys);
				expect(typeof enum1).toBe("object");
				for (var i = 0; i < keys.length; i++) {
					expect(enum1[keys[i]]).toBe(i);
					expect(enum1[i]).toBe(keys[i]);
				}
			});

			expect(base.enum.bind(null)).toThrow();
			expect(base.enum.bind(null, '1', 'a')).toThrow(); // Integer keys
			expect(base.enum.bind(null, 'a', '1')).toThrow(); // Integer keys
			expect(base.enum.bind(null, 'a', 'a')).toThrow(); // Repeated keys
			expect(base.enum.bind(null, 'a', 'b', 'b')).toThrow(); // Repeated keys
		});
	}); //// describe
}); //// define
