/** # Text

Text manipulation functions and definitions.
*/
var Text = exports.Text = declare({
	/** Text is similar to Java's [`StringBuilder`](http://docs.oracle.com/javase/7/docs/api/java/lang/StringBuilder.html), 
	but with extended formatting features.
	*/
	constructor: function Text() {
		this.clear();
	},
	
	/** `clear()` empties the text buffer, but returns the previous content.
	*/
	clear: function clear() {
		var text = this.text;
		this.text = '';
		return text;
	},
	
	/** `add(...strings)` concatenates all arguments conversions to string to 
	the buffer.
	*/
	add: function add() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += arguments[i];
		}
	},
	
	/** The default conversion to string returns the content of the buffer. */
	toString: function toString() {
		return this.text;
	},
	
	// ## Formatting, encoding and decoding ####################################
	
	// ### XML (and HTML for most intends and purposes) ########################
	
	/** `escapeXML(str)` returns the string with XML reserved characters 
	replaced by the corresponding character entities.
	*/
	escapeXML: function escapeXML(str) {
		var XML_ENTITIES = this.XML_ENTITIES;
		return (str +'').replace(/[&<>"']/g, function (c) {
			return XML_ENTITIES[c];
		});
	},
	
	/** The XML character entities are defined in `XML_ENTITIES`:
	*/
	XML_ENTITIES: { 
		'<': '&lt;', 
		'>': '&gt;', 
		'&': '&amp;', 
		'"': '&quot;', 
		"'": '&apos;' 
	},

	/** `addXML(...str)` appends all arguments string conversions after applying 
	`escapeXML()`.
	*/
	addXML: function addXML() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += this.escapeXML(arguments[i]);
		}
	},
	
	// ### Regular expressions #################################################
	
	/** `escapeRegExp(str)` returns the `str` string with the reserved 
	characters of regular expressions escaped with `'\'`.
	*/
	escapeRegExp: function escapeRegExp(str) {
		return (str +'').replace(/[\-\[\]{}()*+?.^$\\]/g, '\\$&');
	},
	
	// ### Dates ###############################################################
	
	/** `formatDate(date=now, format=Date.toString, useUTC=false)` formats a
	Date. The `format` string  may use `y` for year, `m` for month, `d` for day 
	(in month), `h` for hour (24), `H` for hour (am/pm), `n` for minutes, `s` 
	for seconds, `S` for milliseconds, and `a` or `A` for am/pm.
	*/
	formatDate: function formatDate(date, format, useUTC) {
		date = date || new Date();
		var lpad = Text.lpad;
		return !format ? date.toString() : format.replace(/(y+|m+|d+|h+|H+|n+|s+|S+|a+|A+|"[^"]*")/g, 
			function (match) {
				switch (match.charAt(0)) {
				case 'y': return lpad((useUTC ? date.getUTCFullYear() : date.getFullYear()) +'', match.length, '0');
				case 'm': return lpad(((useUTC ? date.getUTCMonth() : date.getMonth()) + 1) +'', match.length, '0');
				case 'd': return lpad((useUTC ? date.getUTCDate() : date.getDate()) +'', match.length, '0');
				case 'h': return lpad((useUTC ? date.getUTCHours() : date.getHours()) +'', match.length, '0');
				case 'H': return lpad((useUTC ? date.getUTCHours() : date.getHours()) % 12 +'', match.length, '0');
				case 'n': return lpad((useUTC ? date.getUTCMinutes() : date.getMinutes()) +'', match.length, '0');
				case 's': return lpad((useUTC ? date.getUTCSeconds() : date.getSeconds()) +'', match.length, '0');
				case 'S': return lpad((useUTC ? date.getUTCMilliseconds() : date.getMilliseconds()) +'', match.length, '0');
				case 'a': return ['am','pm'][~~((useUTC ? date.getUTCHours() : date.getHours()) / 12)].substr(0, match.length);
				case 'A': return ['AM','PM'][~~((useUTC ? date.getUTCHours() : date.getHours()) / 12)].substr(0, match.length);
				case '"': return match.substr(1, match.length-2);
				default: return match;
				}
			});
	},
	
	/** `addDate(date=now, format=Date.toString, useUTC=false)` appends the 
	`date` formatted using `formatDate()`.
	*/
	addDate: function addDate(date, format, useUTC) {
		this.text += this.formatDate(date, format, useUTC);
	},
	
	// ## _Static_ members #####################################################
	
	/** `lpad(str, len, pad=' ')` returns a copy of the `str` string padded with 
	`pad` (or space by default) to the left upto `len` length.
	*/
	'static lpad': function lpad(str, len, pad) {
		if (isNaN(len) || str.length >= len) {
			return str;
		} else {
			pad = (pad || ' ') +'';
			return (pad.repeat((len - str.length) / pad.length + 1) + str).substr(-len);
		}
	},

	/** `rpad(str, len, pad=' ')` returns a copy of the `str` string padded with 
	`pad` (or space by default) to the right upto `len` length.
	*/
	'static rpad': function rpad(str, len, pad) {
		if (isNaN(len) || str.length >= len) {
			return str;
		} else {
			pad = (pad || ' ') +'';
			return (str + pad.repeat((len - str.length) / pad.length + 1)).substr(0, len);
		}
	},
	
	/** `hashCode(str)` calculates a hash number for the given string.
	*/
	'static hashCode': function hashCode(str) {
		var result = 0,
			len = str.length;
		for (var i = 0; i < len; ++i) { 
			result = (result * 31 + str.charCodeAt(i)) & 0x7FFFFFFF;
		}
		return result;
	}
}); // declare Text.

Text.escapeXML = Text.prototype.escapeXML;
Text.escapeRegExp = Text.prototype.escapeRegExp;
Text.formatDate = Text.prototype.formatDate;

