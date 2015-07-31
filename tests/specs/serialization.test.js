define(['sermat', 'base'], function (Sermat, base) { "use strict";
	var declare = base.declare,
		Statistic = base.Statistic,
		Statistics = base.Statistics;
	
	describe("Serializations", function () {
		it("for Statistic & Statistics", function () {
			var sermat = new Sermat();
			sermat.include(base);
			
			var stat = new Statistic({key: 'x', n: 1});
			stat.addAll([2, 3, 5], 'data');
			var serialized = sermat.ser(stat),
				materialized = sermat.mat(serialized);
			expect(materialized.constructor).toBe(Statistic);
			expect(materialized.keys).not.toBeUndefined();
			expect(materialized.keys.key).toBe('x');
			expect(materialized.keys.n).toBe(1);
			expect(materialized.count()).toBe(stat.count());
			expect(materialized.sum()).toBe(stat.sum());
			expect(materialized.minimum()).toBe(stat.minimum());
			expect(materialized.maximum()).toBe(stat.maximum());
			
			var stats = new Statistics();
			stats.add({key: 'x'}, 2);
			stats.add({key: 'x', n: 1}, 3);
			stats.add({key: 'x', n: 1}, 5);
			serialized = sermat.ser(stats);
			materialized = sermat.mat(serialized);
			expect(materialized.constructor).toBe(Statistics);
			expect(materialized.count({key: 'x'})).toBe(3);
			expect(materialized.count({key: 'x', n: 1})).toBe(2);
			expect(materialized.sum({key: 'x'})).toBe(10);
			expect(materialized.sum({key: 'x', n: 1})).toBe(8);
		}); // it "for Statistic & Statistics"
	}); // describe.
}); // define.