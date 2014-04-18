/* Text manipulation definitions.
*/
// String prototype leveling. //////////////////////////////////////////////////

// See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat>.
String.prototype.repeat || (String.prototype.repeat = function repeat(n) {
	n = n | 0;
	return n <= 0 ? "" : n & 1 ? this + this.repeat(n - 1) : (this + this).repeat(n >> 1);
});

// Text ////////////////////////////////////////////////////////////////////////

var Text = exports.Text = declare({
	/** new Text():
		Similar to Java's StringBuilder, but with extended formatting features.
	*/
	constructor: function Text() {
		this.clear();
	},
	
	/** Text.clear():
		Clears the text buffer. Returns the previous content.
	*/
	clear: function clear() {
		var text = this.text;
		this.text = '';
		return text;
	},
	
	/** Text.add(...strings):
		Adds all arguments' conversion to string to the buffer.
	*/
	add: function add() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += arguments[i];
		}
	},
	
	// Formatting, encoding and decoding. //////////////////////////////////////
	
	/** Text.XML_ENTITIES:
		An object mapping XML special characters to their corresponding 
		character entity.
	*/
	XML_ENTITIES: { 
		'<': '&lt;', 
		'>': '&gt;', 
		'&': '&amp;', 
		'"': '&quot;', 
		"'": '&apos;' 
	},
		
	/** Text.escapeXML(str):
		Returns the string with XML reserved characters replaced by the 
		corresponding character entities.
	*/
	escapeXML: function escapeXML(str) {
		var XML_ENTITIES = Text.prototype.XML_ENTITIES;
		return (str +'').replace(/[&<>"']/g, function (c) {
			return XML_ENTITIES[c];
		});
	},

	/** Text.addXML(...str):
		Appends all arguments after applying Text.escapeXML().
	*/
	addXML: function addXML() {
		for (var i = 0; i < arguments.length; i++) {
			this.text += this.escapeXML(arguments[i]);
		}
	},
	
	/** Text.escapeRegExp(str):
		Returns the str string with the reserved characters of regular 
		expressions escaped with '\'.
	*/
	escapeRegExp: function escapeRegExp(str) {
		return (str +'').replace(/[\-\[\]{}()*+?.^$\\]/g, '\\$&');
	},
	
	/** Text.formatDate(date=now, format=Date.toString, useUTC=false):
		Date and time formatter: 'y' for year, 'm' for month, 'd' for day (in 
		month), 'h' for hour (24), 'H' for hour (am/pm), 'n' for minutes,
		's' for seconds, 'S' for milliseconds, 'a' for am/pm, 'A' for AM/PM.
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
	
	/** Text.addDate(date=now, format=Date.toString, useUTC=false):
		Appends the date formatted using Text.formatDate().
	*/
	addDate: function addDate(date, format, useUTC) {
		this.text += this.formatDate(date, format, useUTC);
	},
	
	// Generic methods /////////////////////////////////////////////////////////
	
	toString: function toString() {
		return this.text;
	}
}); // declare Text.

// Static members of Text //////////////////////////////////////////////////////

Text.escapeXML = Text.prototype.escapeXML;
Text.escapeRegExp = Text.prototype.escapeRegExp;
Text.formatDate = Text.prototype.formatDate;

/** static Text.lpad(str, len, pad=' '):
	Returns a copy of the str string padded with pad (or space by default) to 
	the left upto len length.
*/
Text.lpad = function lpad(str, len, pad) {
	if (isNaN(len) || str.length >= len) {
		return str;
	} else {
		pad = (pad || ' ') +'';
		return (pad.repeat((len - str.length) / pad.length + 1) + str).substr(-len);
	}
};

/** Text.rpad(str, len, pad=' '):
	Returns a copy of the str string padded with pad (or space by default) to 
	the right upto len length.
*/
Text.rpad = function rpad(str, len, pad) {
	if (isNaN(len) || str.length >= len) {
		return str;
	} else {
		pad = (pad || ' ') +'';
		return (str + pad.repeat((len - str.length) / pad.length + 1)).substr(0, len);
	}
};