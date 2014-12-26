define(['base'], function (base) { "use strict";
	var math = base.math;
	
	describe("math", function () {
		it(".factorial()", function () {
			expect(typeof math.factorial).toBe('function');
			[[0,1], [1,1], [2,2], [3,6], [4,24], [5,120], [6,720]].forEach(function (test) {
				expect(math.factorial(test[0])).toBe(test[1]);
			});
			expect(math.factorial(-1)).toBeNaN();
		}); // factorial().
		
	}); //// describe math.
});