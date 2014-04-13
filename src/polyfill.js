// Forward compatibility.

if (!Function.prototype.bind) {
	// See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind>.
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