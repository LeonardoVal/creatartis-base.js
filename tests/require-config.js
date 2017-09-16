(function () { "use strict";
	var config = {
		paths: {
			"creatartis-base": "../build/creatartis-base.min",
			"sermat": "../node_modules/sermat/build/sermat-umd-min"
		}
	};
	require.config(config);
	console.log("RequireJS configuration: "+ JSON.stringify(config, null, '  '));
})();
