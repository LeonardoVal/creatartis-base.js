/** # Polyfill

This part of the library contains all code meant to equalize Javascript 
execution environments, to provide some sort of forward compatibility.
*/ 

/** Some versions of Opera and Internet Explorer do not support 
[Function.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
*/
if (!Function.prototype.bind) {
	Function.prototype.bind = function bind(_this) {
		if (typeof this !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
		if (arguments.length < 1) {
			return this;
		}
		var args = Array.prototype.slice.call(arguments, 1), 
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(_this, args.concat(Array.prototype.slice.call(arguments)));
			};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}

/** [String.repeat](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat)
concatenates a string a given amount of times.
*/
if (!String.prototype.repeat) {
	String.prototype.repeat = function repeat(n) {
		n = n | 0;
		return n <= 0 ? "" : n & 1 ? this + this.repeat(n - 1) : (this + this).repeat(n >> 1);
	};
}
