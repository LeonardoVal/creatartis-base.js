/** # Enumerations

ES5 enumerations definitions.
*/
exports.enum = function enumeration(keys) {
	if (arguments.length > 1) {
		keys = Array.prototype.slice.call(arguments);
	}
	raiseIf(keys.length < 1, "Empty key set for enum!");
	var r = {}, k;
	for (var i = 0; i < keys.length; i++) {
		k = keys[i] +"";
		raiseIf((k |0) +"" === k, "Invalid key '", k, "' for enum!");
		raiseIf(r.hasOwnProperty(k), "Repeated key '", k, "' in enum!");
		r[k] = i;
		r[i] = k;
	}
	return Object.freeze(r);
};
