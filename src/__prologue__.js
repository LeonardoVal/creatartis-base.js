/** Package wrapper and layout.
*/
"use strict";
(function (global, init) { // Universal Module Definition. See <https://github.com/umdjs/umd>.
	if (typeof define === 'function' && define.amd) {
		define([], init); // AMD module.
	} else if (typeof exports === 'object' && module.exports) {
		module.exports = init(); // CommonJS module.
	} else { // Browser or web worker (probably).
		global.base = init();
	}
})(this, function __init__(){
// Library layout. /////////////////////////////////////////////////////////////
	var exports = {
		__name__: 'creatartis-base',
		__init__: (__init__.dependencies = [], __init__),
		toString: function toString() {
			var module = this,
				privateRegExp = /^__+(.*?)__+$/,
				members = Object.keys(this);
			members.sort();
			return "module creatartis-base[ "+ members.filter(function (member) {
				return !privateRegExp.exec(member)
			}).map(function (member) {
				return member + (typeof module[member] === 'function' ? '()' : '');
			}).join(" ") + " ]";
		}
	};