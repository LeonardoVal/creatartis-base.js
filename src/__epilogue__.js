// See __prologue__.js
	[	Randomness, Randomness.LinearCongruential, Randomness.MersenneTwister,
		Statistic, Statistics
	].forEach(function (type) {
		type.__SERMAT__.identifier = exports.__package__ +'.'+ type.__SERMAT__.identifier;
		exports.__SERMAT__.include.push(type);
	});
	return exports;
});