/** # Functions

Utilities to simplify functional programming in Javascript.
*/
var functions = exports.functions = {};

/** ## Premade functions. ##########################################################################

Without currying, is sometimes cumbersome to pass a simple functions (like Javascript operators) to
a higher order function like `Array.map`. These premade functions try to make this easier.
*/

/** Must have [SKI](https://en.wikipedia.org/wiki/SKI_combinator_calculus). The identity function
`I` or `id` returns its argument as it is given.
*/
functions.I = functions.id = function id(x) {
	return x;
};

/** The `K` function takes two arguments and returns the first one, ignoring the second one.
*/
functions.K = function id(x) {
	return x;
};

/** The `S` function takes three arguments, the first two being functions. This may probably have
little use, but it is added for cultural reasons.
*/
functions.S = function id(x, y, z) {
	return x.call(this, z, y.call(this, z));
};

/** Almost all Javascript's operators are available as functions. A function for the comma does not
make much sense.
 */
functions.__infixOperator__ = function (op) {
	return new Function('x', 'y', 'return (x '+ op +' y);');
};

'+ * - / % < > <= >= == === != !== & | ^ << >> >>> && || in instanceof'.split(/\s+/).forEach(function (op) {
	var f = functions.__infixOperator__(op);
	functions[op] = f;
	functions['('+ op +')'] = f;
});

functions['~'] = functions['~()'] = new Function('x', 'return ~x;');
functions['!'] = functions['!()'] = new Function('x', 'return !x;');
functions['+()'] = new Function('x', 'return +x;');
functions['-()'] = new Function('x', 'return -x;');
functions['typeof'] = functions['typeof()'] = new Function('x', 'return typeof x;');
functions['void'] = functions['void()'] = new Function('x', 'return void x;');

functions['.'] = functions['(.)'] = new Function('x', 'y', 'return x[y];');
functions['?:'] = functions['(?:)'] = new Function('x', 'y', 'z', 'return x ? y : z;');
