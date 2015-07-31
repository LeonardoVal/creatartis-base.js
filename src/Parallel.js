/** # Parallel

Wrapper for standard web workers, that includes bootstraping and a future oriented interface.
*/
var Parallel = exports.Parallel = declare({
	/** The constructor may take a worker instance to deal with. If not given, a new worker is build 
	using `newWorker()`. If given, it must be properly initialized.
	*/
	constructor: function Parallel(worker) {
		if (!worker) {
			worker = Parallel.newWorker();
		}
		worker.onmessage = this.__onmessage__.bind(this);
		this.worker = worker;
	},
	
	/** `newWorker()` builds a new web worker. Loading `creatartis-base` in its environment. Sets up
	a message handler that evaluates posted messages as code, posting the results back.
	*/
	"static newWorker": function newWorker() {
		var src = 'self.base = ('+ exports.__init__ +')();'+
				'self.onmessage = ('+ (function (msg) {
					try {
						self.base.Future.when(eval(msg.data)).then(function (result) {
							self.postMessage(JSON.stringify({ result: result }));
						});
					} catch (err) {
						self.postMessage(JSON.stringify({ error: err +'' }));
					}
				}) +');',
			blob = new Blob([src], { type: 'text/javascript' });
		return new Worker(URL.createObjectURL(blob));
	},	
	
	/** The handler for the `worker.onmessage` event is the `__onmessage__(msg)` method. It deals 
	with the futures issued by `run()`.
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
	
	/** `run(code)` sends the code to run in the web worker in parallel.
	
	Warning! This method will raise an error if it is called while a previous execution is still 
	running.
	*/
	run: function run(code) {
		if (this.__future__) {
			throw new Error('Worker is working!');
		}
		this.__future__ = new Future();
		this.worker.postMessage(code +'');
		return this.__future__;
	}, 
	
	/** A _"static"_ version of `run(code)` is provided also. It creates a web worker to run this 
	code in parallel, and returns a future for its result. After its finished the web worker is 
	terminated.
	*/
	"static run": function run(code) {
		var parallel = new Parallel();
		return parallel.run(code).always(function () {
			parallel.worker.terminate();
		});
	},
	
	/** `loadModule` loads a module in the worker. The module has to have a `__name__`, an 
	`__init__` function that builds the module and a `__dependencies__` array of modules.
	*/
	loadModule: function loadModule(module, recursive) {
		var parallel = this;
		return Future.sequence(recursive ? module.__dependencies__ : [], function (dep) {
			return parallel.loadModule(dep, recursive);
		}).then(function () {
			return parallel.run('self.'+ module.__name__ +' || (self.'+ module.__name__ +'=('+ 
				module.__init__ +')('+ 	module.__dependencies__.map(function (dep) {
					return dep.__name__;
				}).join(',') +')), "OK"'
			);
		});
	}
}); // declare Parallel.