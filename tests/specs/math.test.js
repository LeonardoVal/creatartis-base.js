define(['base'], function (base) { "use strict";
	var math = base.math;
	
	describe("math", function () {
		it(".clamp()", function () {
			expect(typeof math.clamp).toBe('function');
			for (var i = -2; i < 5; ++i) {
				for (var min = -2; min < 3; ++min) {
					for (var max = min + 1; max < 4; ++max) {
						var clamped = math.clamp(i, min, max);
						expect(clamped).not.toBeLessThan(min);
						expect(clamped).not.toBeGreaterThan(max);
					}
				}
			}
		}); // clamp().
		
		it(".sign()", function () {
			expect(typeof math.sign).toBe('function');
			for (var i = -3; i < 4; ++i) {
				expect(math.sign(i)).toBe(i < 0 ? -1 : i > 0 ? +1 : 0);
			}
			expect(math.sign(-Infinity)).toBe(-1);
			expect(math.sign(+Infinity)).toBe(+1);
			expect(math.sign(NaN)).toBeNaN();
			expect(math.sign('a')).toBeNaN();
		}); // sign().
		
		it(".factorial()", function () {
			expect(typeof math.factorial).toBe('function');
			[[0,1], [1,1], [2,2], [3,6], [4,24], [5,120], [6,720]].forEach(function (test) {
				expect(math.factorial(test[0])).toBe(test[1]);
			});
			expect(math.factorial(-1)).toBeNaN();
		}); // factorial().
		
		
		
	}); //// describe math.
});