define(['base'], function (base) { "use strict";
	var declare = base.declare,
		Serialization= base.Serialization,
		Statistic = base.Statistic,
		Statistics = base.Statistics;
	
	describe("Serialization", function () {
		it("for custom classes", function () {
			var Class1 = declare({
					constructor: function Class1(args) {
						this.a = args.a;
						this.b = args.b;
					}
				}),
				classId1 = 'creatartis-base.tests.Class1';
			Serialization.register(classId1, Class1); // with defaults
			var instance = new Class1({a: 1, b: '7'}),
				serialized = JSON.stringify(Serialization.serialize(classId1, instance)),
				materialized = Serialization.materialize(serialized, classId1);
			expect(materialized.constructor).toBe(Class1);
			expect(materialized.a).toBe(instance.a);
			expect(materialized.b).toBe(instance.b);
			
			var classId2 = 'creatartis-base.tests.Class1#array';
			Serialization.register(classId2, Class1, // with custom methods
				function serialize(obj) {
					return [obj.a, obj.b];
				},
				function materialize(data) {
					if (typeof data !== 'object') {
						data = JSON.parse(data);
					}
					return new Class1({a: data[0], b: data[1]});
				});
			instance = new Class1({a: 2.1, b: 'x'});
			serialized = Serialization.serialize(classId2, instance),
			materialized = Serialization.materialize(serialized, classId2);
			expect(materialized.constructor).toBe(Class1);
			expect(materialized.a).toBe(instance.a);
			expect(materialized.b).toBe(instance.b);
		}); // it "for custom class"
		
		it("for Statistic & Statistics", function () {
			var stat = new Statistic({key: 'x', n: 1});
			stat.addAll([2, 3, 5], 'data');
			var serialized = JSON.stringify(stat.__serialize__()),
				materialized = Serialization.materialize(serialized);
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
			serialized = JSON.stringify(stats.__serialize__());
			materialized = Serialization.materialize(serialized);
			expect(materialized.constructor).toBe(Statistics);
			expect(materialized.count({key: 'x'})).toBe(3);
			expect(materialized.count({key: 'x', n: 1})).toBe(2);
			expect(materialized.sum({key: 'x'})).toBe(10);
			expect(materialized.sum({key: 'x', n: 1})).toBe(8);
		}); // it "for Statistic & Statistics"
	}); // describe.
}); // define.