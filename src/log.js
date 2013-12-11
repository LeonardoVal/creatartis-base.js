/** basis/log.js:
	Simple logging.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
// Logger //////////////////////////////////////////////////////////////////////

var Logger = exports.Logger	= declare({
	/** new Logger(name, parent=Logger.ROOT, level="INFO"):
		Constructor of logger objects, which handle logging capabilities in a
		similar (but greatly simplified) fashion that Log4J.
	*/
	constructor: function Logger(name, parent, level) { 
		this.name = ''+ name;
		this.parent = parent || Logger.ROOT;
		this.level = level || "INFO";
		this.appenders = [];
	},
	
	/** Logger.LEVELS:
		Logging levels to use with Loggers: TRACE, DEBUG, INFO, WARN, ERROR and
		FATAL. The default one is INFO. Each one has a shortcut method (name in 
		lower case) to log directly in that level.
	*/
	LEVELS: {
		TRACE: -Infinity, DEBUG: -1, INFO: 0, WARN: 1, ERROR: 2, FATAL: Infinity,
		OK: 0, FAIL: 1, TODO: 1, FIXME: 1 // Utility levels.
	},
	
	/** Logger.log(level, message...):
		If the given level is greater than the current logger's level, a new
		entry is appended. The message results of a timestamp and the arguments.
	*/
	log: function log(level) {
		var passes = this.LEVELS[this.level] <= this.LEVELS[level];
		if (passes) {
			var logger = this,
				message = Array.prototype.slice.call(arguments, 1).join('');
			this.appenders.forEach(function (appender) {
				var format = appender.format || logger.defaultFormat;
				appender(format(logger.name, new Date(), level, message));
			});
			if (this.parent) {
				this.parent.log.apply(this.parent, arguments); // Forward to parent.
			}
		}
		return passes;
	},
	
	/** Logger.trace(message...):
		Make a new log entry with the given message and the TRACE level.
	*/
	trace: function trace() {
		return this.log("TRACE", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** Logger.debug(message...):
		Make a new log entry with the given message and the DEBUG level.
	*/
	debug: function debug() {
		return this.log("DEBUG", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** Logger.info(message...):
		Make a new log entry with the given message and the INFO level.
	*/
	info: function info() {
		return this.log("INFO", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** Logger.warn(message...):
		Make a new log entry with the given message and the WARN level.
	*/
	warn: function warn() {
		return this.log("WARN", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** Logger.error(message...):
		Make a new log entry with the given message and the ERROR level.
	*/
	error: function error() {
		return this.log("ERROR", Array.prototype.slice.call(arguments, 0).join(""));
	},

	/** Logger.fatal(message...):
		Make a new log entry with the given message and the FATAL level.
	*/
	fatal: function fatal() {
		return this.log("FATAL", Array.prototype.slice.call(arguments, 0).join(""));
	},
	
	/** Logger.defaultFormat(name, time, level, message):
		Formats are used by appenders. This default format concatenates the log
		entry data in a string.
	*/
	defaultFormat: function defaultFormat(name, time, level, message) {
		return [level, name, Text.formatDate(time, 'hhnnss.SSS'), message].join(' ');
	},
	
	/** Logger.htmlFormat(tag='pre', cssClassPrefix='log_'):
		Returns a format function similar to the default format, but in an HTML 
		element with CSS styling support.
	*/
	htmlFormat: function htmlFormat(tag, cssClassPrefix) {
		tag = tag || 'p';
		cssClassPrefix = cssClassPrefix || 'log_';
		return function (name, time, level, message) {
			return ['<', tag, ' class="', cssClassPrefix, level, '">', 
				'<span class="', cssClassPrefix, 'level">', level, '</span> ',
				'<span class="', cssClassPrefix, 'name">', name, '</span> ',
				'<span class="', cssClassPrefix, 'time">', Text.formatDate(time, 'hhnnss.SSS'), '</span> ',
				'<span class="', cssClassPrefix, 'message">', 
					Text.escapeXML(message).replace(/\n/g, '<br/>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;'), 
				'</span>',
				'</', tag, '>'].join('');
		};
	},
	
	/** Logger.appendToConsole():
		Appender that writes messages to console (using console.log).
	*/
	appendToConsole: (function () {
		function __consoleAppender__(entry) {
			console.log(entry);
		}
		return function appendToConsole() {
			this.appenders.push(__consoleAppender__);
			return __consoleAppender__;
		};
	})(),
	
	/** Logger.appendToFile(filePath, flags='a', encoding='utf-8'):
		Appender that writes the log entries to a file using NodeJS's file 
		system module.
	*/
	appendToFile: function appendToFile(filepath, flags, encoding) { // Node.js specific.
		filepath = filepath || './log'+ (new Date()).format('yyyymmdd-hhnnss') +'.log';
		flags = flags !== undefined ? flags : 'a';
		encoding = encoding !== undefined ? encoding : 'utf-8';
		var stream = require('fs').createWriteStream(filepath, {flags: flags, encoding: encoding});
		function fileAppender(entry) {
			stream.write(entry +'\n');
		}
		this.appenders.push(fileAppender);
		return fileAppender;
	},
	
	/** Logger.appendToHtml(htmlElement=document.body, maxEntries=all):
		Appender that writes the log entries as paragraphs inside the given 
		htmlElement. The number of entries can be limited with maxEntries.
		Warning! Formatted entry text is assumed to be valid HTML and hence is
		not escaped.
	*/
	appendToHtml: function appendToHtml(htmlElement, maxEntries, reversed) { // Browser specific.
		maxEntries = (+maxEntries) || Infinity;
		reversed = !!reversed;
		if (typeof htmlElement === 'string') {
			htmlElement =  document.getElementById(htmlElement);
		} else {
			htmlElement = htmlElement || document.getElementsByTagName('body')[0];
		}
		var entries = [];
		function htmlAppender(entry) {
			if (reversed) {
				entries.unshift(entry);
				while (entries.length > maxEntries) {
					entries.pop();
				}
			} else {
				entries.push(entry);
				while (entries.length > maxEntries) {
					entries.shift();
				}
			}
			htmlElement.innerHTML = entries.join('\n');
		}
		this.appenders.push(htmlAppender);
		return htmlAppender;
	},
	
	/** Logger.appendAsWorkerMessages(messageTag='log'):
		Appender that posts the log entries with the web workers postMessage()
		function.
	*/
	appendAsWorkerMessages: function appendAsWorkerMessages(messageTag) {
		messageTag = ''+ (messageTag || 'log');
		function postMessageAppender(entry) {
			var message = ({});
			message[messageTag] = entry;
			self.postMessage(JSON.stringify(message));
		}
		postMessageAppender.format = function format(name, time, level, message) {
			return {name: name, time: time, level: level, message: message};
		};
		this.appenders.push(postMessageAppender);
		return postMessageAppender;
	},
	
	/** Logger.stats():
		Gets the logger's Statistics objects, creating it if necessary.
	*/
	stats: function stats() {
		return this.__stats__ || (this.__stats__ = new Statistics());
	}
}); // declare Logger.	

/** static Logger.ROOT:
	The root logger must be the final ancestor of all loggers. It is the default 
	parent of the Logger constructor.
*/
Logger.ROOT = new Logger("");
