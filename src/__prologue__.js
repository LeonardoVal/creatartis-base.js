/** Package wrapper and layout.
*/
"use strict";
(function (init) { // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define([], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(); // CommonJS module.
	} else { // Browser or web worker (probably).
		(0, eval)('this').ludorum = init(global.basis);
	}
})(function __init__(basis){
// Library layout. /////////////////////////////////////////////////////////////
	var exports = {
		__init__: __init__
	};
	exports.__init__.dependencies = [];