/* Wrapper for standard web workers, that includes bootstraping and a Future 
	oriented interface.
*/
var Parallel = exports.Parallel = declare({
	/** new Parallel(worker=<new worker>):
		A wrapper around the standard web worker.
	*/
	constructor: function Parallel(worker) {
		if (!worker) {
			worker = Parallel.newWorker();
		}
		/** Parallel.worker:
			Actual Worker instance behind this wrapper.
		*/
		worker.onmessage = this.__onmessage__.bind(this);
		this.worker = worker;
	},
	
	/** static Parallel.newWorker():
		Builds a new web worker. Loading basis in its environment. Sets up a
		message handler that evaluates posted messages as code, posting the
		results back.
	*/
	"static newWorker": function newWorker() {
		var src = 'self.basis = ('+ exports.__init__ +')();'+
				'self.onmessage = ('+ (function (msg) {
					try {
						self.basis.Future.when(eval(msg.data)).then(function (result) {
							self.postMessage(JSON.stringify({ result: result }));
						});
					} catch (err) {
						self.postMessage(JSON.stringify({ error: err +'' }));
					}
				}) +');',
			blob = new Blob([src], { type: 'text/javascript' });
		return new Worker(URL.createObjectURL(blob));
	},	
	
	/** Parallel.__onmessage__(msg):
		The handler for this.worker onmessage event, that deals with the 
		futures issued by this.run().
	*/
	__onmessage__: function __onmessage__(msg) {
		var future = this.__future__;
		if (future) {
			this.__future__ = null;
			try {
				var data = JSON.parse(msg.data);
				if (data.error) {
					future.reject(data.error);
				} else {
					future.resolve(data.result);
				}
			} catch (err) {
				future.reject(err);
			}
		}
	},
	
	/** Parallel.run(code):
		Sends the code to run in the web worker. Warning! This method will raise
		an error if it is called while a previous execution is still running.
	*/
	run: function run(code) {
		if (this.__future__) {
			throw new Error('Worker is working!');
		}
		this.__future__ = new Future();
		this.worker.postMessage(code +'');
		return this.__future__;
	},
	
	/** static Parallel.run(code):
		Creates a web worker to run this code in parallel, and returns a future
		for its result. After its finished the web worker is terminated.
	*/
	"static run": function run(code) {
		var parallel = new Parallel();
		return parallel.run(code).always(function () {
			parallel.worker.terminate();
		});
	}
}) // declare Parallel.