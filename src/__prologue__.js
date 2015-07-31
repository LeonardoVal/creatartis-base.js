/** Package wrapper and layout.
*/
(function (global, init) { "use strict"; // Universal Module Definition. See <https://github.com/umdjs/umd>.
	if (typeof define === 'function' && define.amd) {
		define(['sermat'], init); // AMD module.
	} else if (typeof exports === 'object' && module.exports) {
		module.exports = init(require('sermat')); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.base = init(global.Sermat);
	}
})(this, function __init__(Sermat) { "use strict";
// Library layout. /////////////////////////////////////////////////////////////////////////////////
	var exports = {
		__package__: 'creatartis-base',
		__name__: 'base',
		__init__: __init__,
		__dependencies__: [],
		__SERMAT__: { include: [] }
	};